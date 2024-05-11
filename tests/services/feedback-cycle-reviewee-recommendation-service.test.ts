import { snsService } from '@pulsifi/fn';
import { SQSEvent } from 'aws-lambda';
import { DataSource } from 'typeorm';

import * as database from '../../src/database';
import { FeedbackCycleReviewee } from '../../src/models';
import { FeedbackCycleRevieweeRecommendation } from '../../src/models/feedback-cycle-reviewee-recommendation.entity';
import { feedbackCycleRevieweeRecommendationService } from '../../src/services/feedback-cycle-reviewee-recommendation.service';
import { getTestDataSourceAndAddData } from '../setup';
import { testData } from './fixtures/test-data';

jest.mock('@pulsifi/fn/services/sns.service');

jest.mock('../../src/services/recommendation.service', () => {
    const mBInstance = {
        getActionWithSkillsRecommendation: jest.fn(
            () => testData.mockRecommendationActionResponse,
        ),
        getResourcesRecommendation: jest.fn(
            () => testData.mockRecommendationResourceResponse,
        ),
    };
    const mB = jest.fn(() => mBInstance);
    return { RecommendationService: mB };
});

jest.mock('../../src/services/company.service', () => {
    const mBInstance = {
        getCompanyById: jest.fn(() => testData.mockCompanyLookupData),
    };
    const mB = jest.fn(() => mBInstance);
    return { CompanyService: mB };
});

describe('feedbackCycleRevieweeRecommendationService', () => {
    let dataSource: DataSource;
    const spygetDataSource = jest.spyOn(database, 'getDataSource');
    const urlMatchedRegex = '^https://local-employee.pulsifi.me/';

    beforeAll(async () => {
        dataSource = await getTestDataSourceAndAddData(
            testData.entitiesFeedbackCycleRecommendationToBeAdded,
        );
        spygetDataSource.mockImplementation(() => {
            return Promise.resolve(dataSource);
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('handleRecommendationProcessRequest', async () => {
        // Act
        const results =
            await feedbackCycleRevieweeRecommendationService.handleRecommendationProcessRequest(
                testData.mockFeedbackRecommendationGenerationProcessEvent as SQSEvent,
            );

        //Assert
        expect({ results }).toMatchSnapshot({
            results: new Array(results.length).fill({
                id: expect.anything(),
                feedback_cycle_reviewee_id: expect.anything(),
            }),
        });
    });

    it('handleRecommendationGenerationRequest', async () => {
        // Act
        const results =
            await feedbackCycleRevieweeRecommendationService.handleRecommendationGenerationRequest(
                testData.mockFeedbackRecommendationGenerationRequestData,
            );

        //Assert
        expect({ results }).toMatchSnapshot({
            results: {
                id: expect.anything(),
                feedback_cycle_reviewee_id: expect.anything(),
            },
        });
        const reviewee = await dataSource
            .getRepository(FeedbackCycleReviewee)
            .findOne({
                select: {
                    id: true,
                },
                where: {
                    id: testData.reviewee1.id,
                },
            });

        expect(reviewee).toMatchSnapshot({
            id: expect.anything(),
        });

        const revieweeRecommendation = await dataSource
            .getRepository(FeedbackCycleRevieweeRecommendation)
            .find({
                select: {
                    id: true,
                    skill: true,
                    action: true,
                    resource_course: true,
                    resource_book: true,
                },
                where: {
                    feedback_cycle_reviewee_id: testData.reviewee1.id,
                },
            });

        expect({ results: revieweeRecommendation }).toMatchSnapshot({
            results: new Array(revieweeRecommendation.length).fill({
                id: expect.anything(),
                action: new Array(
                    revieweeRecommendation[0].action?.length,
                ).fill({
                    id: expect.anything(),
                }),
                resource_book: new Array(
                    revieweeRecommendation[0].resource_book?.length,
                ).fill({
                    id: expect.anything(),
                }),
                resource_course: new Array(
                    revieweeRecommendation[0].resource_course?.length,
                ).fill({
                    id: expect.anything(),
                }),
            }),
        });
    });

    it('handleRecommendationEndedRequest', async () => {
        // Arrange
        jest.mocked(snsService.sendEventModel).mockResolvedValueOnce();

        // Act
        await feedbackCycleRevieweeRecommendationService.handleRecommendationEndedRequest(
            testData.mockFeedbackRecommendationGenerationEndedEvent,
        );

        // Assert
        const reviewee = await dataSource
            .getRepository(FeedbackCycleReviewee)
            .findOne({
                select: ['id', 'recommendation_result_meta'],
                where: {
                    id: testData.reviewee6.id,
                },
            });

        expect(reviewee).toMatchSnapshot({
            id: expect.anything(),
            recommendation_result_meta: {
                generated_at: expect.any(String),
            },
        });

        expect(
            jest.mocked(snsService.sendEventModel).mock.calls[0][0],
        ).toMatchSnapshot({
            event_id: expect.anything(),
            data: {
                receiver: {
                    id: expect.anything(),
                    employee_id: expect.anything(),
                },
                call_to_action: {
                    url: expect.stringMatching(urlMatchedRegex),
                },
            },
        });
    });
});
