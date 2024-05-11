import {
    EventModel,
    generatorUtil,
    numberUtil as numUtil,
    snsService,
} from '@pulsifi/fn';
import { In } from 'typeorm';

import * as AWSConfig from '../configs';
import { DomainEventType, EmployeeScoreType } from '../constants';
import { getDataSource } from '../database';
import {
    AssessmentResult,
    FitScoreRecipeDto,
    TalentManagementEmployeeAssessmentScoreCalculated,
    TalentManagementEmployeeAssessmentsSubmitted,
} from '../dtos';
import {
    CognitivePartialScoreOutput,
    CultureFitPartialScoreOutput,
    PersonalityPartialScoreOutput,
    ProgramEvent,
} from '../interface';
import { employeeScoreMapper } from '../mappers';
import {
    EmployeeQuestionnaire,
    EmployeeScore,
    Participant,
    Program,
} from '../models';
import { urlGenerator } from '../utils';
import { CognitiveScoreService } from './cognitive-score.service';
import { FitScoreService } from './fit-score.service';
import { PersonalityScoreService } from './personality-score.service';
import { PsychologyService } from './psychology.service';

const HIGH_DIMENSION_THRESHOLD = 0.7;
const LOW_DIMENSION_THRESHOLD = 0.3;

export const EmployeeScoreService = {
    async processEmployeeAssessmentScore(
        data: TalentManagementEmployeeAssessmentsSubmitted,
    ): Promise<void> {
        const cognitiveQuestionnaires = [
            EmployeeScoreType.REASONING_LOGIC,
            EmployeeScoreType.REASONING_NUMERIC,
            EmployeeScoreType.REASONING_VERBAL,
        ];

        const personalityQuestionnaires = [
            EmployeeScoreType.PERSONALITY,
            EmployeeScoreType.WORK_INTEREST,
            EmployeeScoreType.WORK_VALUE,
        ];

        const assessments = data.assessments;

        const personalityAssessments = assessments.filter((a) =>
            personalityQuestionnaires.includes(
                a.questionnaire_framework as EmployeeScoreType,
            ),
        );

        const cognitiveAssessments = assessments.filter((a) =>
            cognitiveQuestionnaires.includes(
                a.questionnaire_framework as EmployeeScoreType,
            ),
        );

        const foundParticipant = await this.getParticipant(data.participant_id);

        let cultureFitScoreRecipe: FitScoreRecipeDto | null = null;
        let roleFitScoreRecipe: FitScoreRecipeDto | null = null;

        if (data.culture_fit_recipe_id) {
            cultureFitScoreRecipe = await this.getFitScoreRecipe(
                data.culture_fit_recipe_id,
            );
        }

        if (data.role_fit_recipe_id) {
            roleFitScoreRecipe = await this.getFitScoreRecipe(
                data.role_fit_recipe_id,
            );
        }

        const processedPersonalityScores = await this.processPersonality(
            personalityAssessments,
            foundParticipant,
            roleFitScoreRecipe,
            data.role_fit_recipe_id!,
        );

        const processedCognitiveScores = await this.processCognitive(
            cognitiveAssessments,
            foundParticipant,
            data.role_fit_recipe_id!,
        );

        const scores = [
            ...processedPersonalityScores,
            ...processedCognitiveScores,
        ];

        const dataSource = await getDataSource();

        if (scores.length) {
            await dataSource.manager.save(EmployeeScore, scores);
        }

        if (cultureFitScoreRecipe) {
            await this.processEmployeeAssessmentScoreCalculated(
                foundParticipant,
                cultureFitScoreRecipe,
                data.company_id,
            );
        }
    },

    async processPersonality(
        assessmentResults: AssessmentResult[],
        participant: Participant,
        fitScoreRecipe: FitScoreRecipeDto | null,
        recipeId: string,
    ): Promise<EmployeeScore[]> {
        const partialPersonalityScores =
            PersonalityScoreService.getPersonalityScores(
                assessmentResults,
                participant,
                fitScoreRecipe,
                recipeId,
            );

        return Promise.all(
            partialPersonalityScores.map(async (personalityScore) =>
                this.processEmployeeScorePayload(
                    participant,
                    personalityScore,
                    recipeId,
                ),
            ),
        );
    },

    async processCognitive(
        assessmentResults: AssessmentResult[],
        participant: Participant,
        recipeId: string,
    ): Promise<EmployeeScore[]> {
        const partialCognitiveScores =
            await CognitiveScoreService.getCognitiveScores(
                assessmentResults,
                participant,
                recipeId,
            );

        return Promise.all(
            partialCognitiveScores.map(async (cognitiveScore) =>
                this.processEmployeeScorePayload(
                    participant,
                    cognitiveScore,
                    recipeId,
                ),
            ),
        );
    },

    async processEmployeeAssessmentScoreCalculated(
        participant: Participant,
        recipe: FitScoreRecipeDto,
        companyId: number,
    ): Promise<void> {
        const employeeScores = await this.getAllScoresByEmployee(
            participant.id,
        );

        await this.sendTMAssessmentScoreCalculated({
            companyId,
            scores: employeeScores,
            recipeId: recipe!.id,
            participant: participant,
            recipe: recipe,
        });
    },

    async sendTMAssessmentScoreCalculated({
        companyId,
        scores,
        recipeId,
        participant,
        recipe,
    }: {
        companyId: number;
        scores: EmployeeScore[];
        recipeId: string;
        participant: Participant;
        recipe: FitScoreRecipeDto;
    }): Promise<void> {
        const data = {
            scores,
            recipe_id: recipeId,
            participant,
            recipe: {
                framework_alias: recipe.framework_alias,
                recipe: recipe.recipe,
            },
        };

        const message: EventModel<TalentManagementEmployeeAssessmentScoreCalculated> =
            {
                event_type:
                    DomainEventType.EMPLOYEE_ASSESSMENTS_SCORE_CALCULATED,
                event_id: participant.employee_id,
                company_id: companyId,
                user_account_id: 0,
                data,
            };

        await snsService.sendEventModel(message, AWSConfig.sns());
    },

    async processEmployeeFitScore(
        data: TalentManagementEmployeeAssessmentScoreCalculated,
    ): Promise<void> {
        const program = await this.getProgramById(data.participant.program_id);

        const fitScoreRecipe = {
            id: data.recipe_id,
            recipe: data.recipe.recipe,
        };

        const shouldCalculateEmployeeFitScore =
            FitScoreService.shouldCalculateEmployeeFitScore(
                program,
                fitScoreRecipe,
                data.scores,
                data.participant.id,
            );

        if (!shouldCalculateEmployeeFitScore) {
            return;
        }

        const partialScoreOutput = FitScoreService.getCultureFitEmployeeScore(
            data.scores,
            data.recipe,
        );

        const cultureFitScore = await this.processEmployeeScorePayload(
            data.participant,
            partialScoreOutput,
            data.recipe_id,
        );

        const processedParticipant = FitScoreService.mapParticipant(
            data.participant,
            partialScoreOutput,
        );

        const dataSource = await getDataSource();
        await dataSource.transaction(async (manager) => {
            await manager.save(Participant, processedParticipant);
            await manager.save(EmployeeScore, cultureFitScore);
        });

        await this.sendResultReadyEvent(processedParticipant);
    },

    async processEmployeeScorePayload(
        participant: Participant,
        partialScoreOutput:
            | CultureFitPartialScoreOutput
            | CognitivePartialScoreOutput
            | PersonalityPartialScoreOutput,
        recipeId: string,
    ): Promise<EmployeeScore> {
        const updatedBy = 1;

        const employeeScore = await this.getEmployeeScore(
            participant.id,
            partialScoreOutput.score_type,
        );

        const processedEmployeeScore = employeeScoreMapper.mapEmployeeScore(
            participant,
            employeeScore,
            partialScoreOutput.score_type,
            partialScoreOutput.score,
            partialScoreOutput.score_outcome,
            recipeId,
            updatedBy,
        );
        processedEmployeeScore.score_dimension =
            partialScoreOutput.score_dimension;

        return processedEmployeeScore;
    },

    getScoreDimension(score: number): number {
        const roundedScore = numUtil.roundDecimalPlace(score);

        if (roundedScore > HIGH_DIMENSION_THRESHOLD) {
            return 2;
        }
        if (roundedScore < LOW_DIMENSION_THRESHOLD) {
            return 0;
        }
        return 1;
    },

    async getParticipant(participantId: string): Promise<Participant> {
        const dataSource = await getDataSource();

        const participantRepo = dataSource.getRepository(Participant);

        return participantRepo.findOneOrFail({
            where: {
                id: participantId,
            },
            relations: ['program', 'employee'],
        });
    },

    async getEmployeeScore(
        participantId: string,
        employeeScoreType: EmployeeScoreType,
    ): Promise<EmployeeScore | null> {
        const dataSource = await getDataSource();
        const employeeScoreRepo = dataSource.getRepository(EmployeeScore);
        return employeeScoreRepo.findOne({
            where: {
                participant_id: participantId,
                score_type: employeeScoreType,
            },
        });
    },

    async getAllScoresByEmployee(
        participantId: string,
    ): Promise<EmployeeScore[]> {
        const dataSource = await getDataSource();

        return await dataSource.getRepository(EmployeeScore).find({
            where: {
                participant_id: participantId,
                score_type: In([
                    EmployeeScoreType.REASONING_LOGICAL,
                    EmployeeScoreType.REASONING_NUMERIC,
                    EmployeeScoreType.REASONING_VERBAL,
                    EmployeeScoreType.WORK_STYLE,
                    EmployeeScoreType.WORK_VALUE,
                    EmployeeScoreType.WORK_INTEREST,
                ]),
            },
        });
    },

    async getEmployeeQuestionnaireByFrameworkType(
        employeeId: string,
        frameworkType: EmployeeScoreType[],
        questionnaireIds: number[],
    ): Promise<EmployeeQuestionnaire[]> {
        const dataSource = await getDataSource();

        return await dataSource.getRepository(EmployeeQuestionnaire).find({
            select: ['framework', 'result_raw'],
            where: {
                employee_id: employeeId,
                framework: In(frameworkType),
                questionnaire_id: In(questionnaireIds),
            },
        });
    },

    async getFitScoreRecipe(recipeId: string): Promise<FitScoreRecipeDto> {
        const fitScoreRecipe =
            await PsychologyService.getFitScoreRecipeById(recipeId);

        return fitScoreRecipe;
    },

    async getProgramById(programId: number): Promise<Program> {
        const dataSource = await getDataSource();

        return await dataSource.getRepository(Program).findOneOrFail({
            where: {
                id: programId,
            },
            select: ['culture_fit_recipe_id', 'company_id', 'assessments'],
        });
    },

    async sendResultReadyEvent(participant: Participant) {
        const inviteLink = urlGenerator.toEmployeeAppUrl(
            DomainEventType.PARTICIPANT_PROGRAM_RESULT_READY,
            { program_id: participant.program_id },
        );

        const message: EventModel<ProgramEvent> = {
            event_type: DomainEventType.PARTICIPANT_PROGRAM_RESULT_READY,
            event_id: generatorUtil.uuid(),
            company_id: participant.company_id,
            user_account_id: participant.employee!.user_account_id!,
            data: {
                email: participant.employee!.work_email,
                program_name: participant.program!.name,
                first_name: participant.employee!.first_name,
                invite_link: inviteLink,
            },
        };

        await snsService.sendEventModel(message, AWSConfig.sns());
    },
};
