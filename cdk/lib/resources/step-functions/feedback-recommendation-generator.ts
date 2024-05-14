/* eslint-disable @typescript-eslint/naming-convention */
import { Duration } from 'aws-cdk-lib';
import {
    Choice,
    Condition,
    DefinitionBody,
    Pass,
    Wait,
    WaitTime,
} from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';

import { BaseStepFunction } from '../../base/base-step-function';
import { StepFunctionResourceProps } from '../../interfaces';
import { accountId, region } from '../../variables';

const stateMachineName = 'feedback-recommendation-generator';

export class FeedbackRecommendationGeneratorResource extends Construct {
    /**
     * FeedbackRecommendationGeneratorResource
     *
     * @param scope {@link Construct}
     * @param id
     * @param props {@link StepFunctionResourceProps}
     */
    constructor(
        scope: Construct,
        id: string,
        props: StepFunctionResourceProps,
    ) {
        super(scope, id);

        const getLambdaArnByName = (functionName: string): string =>
            `arn:aws:lambda:${region}:${accountId}:function:${functionName}:$LATEST`;

        /* Step Function State */
        const listExecutions = BaseStepFunction.stepFunctionCustomState(
            this,
            'ListExecutions',
            {
                Type: 'Task',
                Resource: 'arn:aws:states:::aws-sdk:sfn:listExecutions',
                Parameters: {
                    StateMachineArn: `arn:aws:states:${region}:${accountId}:stateMachine:feedback-recommendation-generator`,
                    StatusFilter: 'RUNNING',
                },
                ResultPath: '$.StateInfo',
            },
        );

        const passState = new Pass(this, 'Pass', {
            parameters: {
                'Records.$': '$.Records',
                'Executions.$': '$.StateInfo.Executions',
                'ExecutionLastQueued.$': '$.StateInfo.Executions[-1:]',
                'totalExecutions.$':
                    'States.ArrayLength($.StateInfo.Executions)',
            },
        });

        const wait = new Wait(this, 'Wait', {
            time: WaitTime.duration(Duration.seconds(15)),
        });

        const condition = Condition.and(
            Condition.stringEqualsJsonPath(
                '$.ExecutionLastQueued[0].Name',
                '$$.Execution.Name',
            ),
        );

        const initializeProcessor = BaseStepFunction.stepFunctionCustomState(
            this,
            'InitializeProcessor',
            {
                Type: 'Task',
                Resource: 'arn:aws:states:::lambda:invoke',
                Parameters: {
                    'Payload.$': '$',
                    FunctionName: getLambdaArnByName(
                        'talent-management-feedback-recommendation-process-request-fn',
                    ),
                },
                Retry: [
                    {
                        ErrorEquals: [
                            'Lambda.ServiceException',
                            'Lambda.AWSLambdaException',
                            'Lambda.SdkClientException',
                            'Lambda.TooManyRequestsException',
                        ],
                        IntervalSeconds: 2,
                        MaxAttempts: 6,
                        BackoffRate: 2,
                    },
                ],
                OutputPath: '$.Payload',
            },
        );

        const map = BaseStepFunction.stepFunctionCustomState(this, 'Map', {
            Type: 'Map',
            ItemProcessor: {
                ProcessorConfig: {
                    Mode: 'DISTRIBUTED',
                    ExecutionType: 'EXPRESS',
                },
                StartAt: 'InnerMap',
                States: {
                    InnerMap: {
                        Type: 'Map',
                        ItemProcessor: {
                            ProcessorConfig: {
                                Mode: 'INLINE',
                            },
                            StartAt: 'Generate',
                            States: {
                                Generate: {
                                    Type: 'Task',
                                    Resource: 'arn:aws:states:::lambda:invoke',
                                    OutputPath: '$.Payload',
                                    Parameters: {
                                        'Payload.$': '$',
                                        FunctionName: getLambdaArnByName(
                                            'talent-management-feedback-recommendation-generation-request-fn',
                                        ),
                                    },
                                    Retry: [
                                        {
                                            ErrorEquals: [
                                                'Lambda.ServiceException',
                                                'Lambda.AWSLambdaException',
                                                'Lambda.SdkClientException',
                                                'Lambda.TooManyRequestsException',
                                            ],
                                            IntervalSeconds: 2,
                                            MaxAttempts: 6,
                                            BackoffRate: 2,
                                            JitterStrategy: 'FULL',
                                        },
                                    ],
                                    End: true,
                                },
                            },
                        },
                        End: true,
                        ItemsPath: '$.Items',
                        ItemSelector: { 'Item.$': '$$.Map.Item.Value' },
                        MaxConcurrency: 1,
                        Retry: [
                            {
                                ErrorEquals: ['States.TaskFailed'],
                                BackoffRate: 2,
                                IntervalSeconds: 1,
                                MaxAttempts: 3,
                                JitterStrategy: 'FULL',
                            },
                        ],
                    },
                },
            },
            ItemBatcher: {
                MaxItemsPerBatch: 1,
            },
            Label: 'Map',
            ResultSelector: {
                'data.$': '$',
                'resultCount.$': 'States.ArrayLength($)',
            },
            MaxConcurrency: 2,
            Retry: [
                {
                    ErrorEquals: ['States.TaskFailed'],
                    BackoffRate: 2,
                    IntervalSeconds: 1,
                    MaxAttempts: 3,
                    JitterStrategy: 'FULL',
                },
            ],
        });

        const isBatchCompleteCondition = Condition.numberGreaterThan(
            '$.resultCount',
            0,
        );

        const processOutputResults = new Pass(this, 'ProcessOutputResults', {
            parameters: {
                'data.$': '$.data[*][*]',
                'feedback_cycle_reviewee_id.$':
                    '$.data[0][0].feedback_cycle_reviewee_id',
            },
        });

        const aggregate = BaseStepFunction.stepFunctionCustomState(
            this,
            'Aggregate',
            {
                Type: 'Task',
                Resource: 'arn:aws:states:::lambda:invoke',
                Parameters: {
                    'Payload.$': '$',
                    FunctionName: getLambdaArnByName(
                        'talent-management-feedback-recommendation-ended-request-fn',
                    ),
                },
                Retry: [
                    {
                        ErrorEquals: [
                            'Lambda.ServiceException',
                            'Lambda.AWSLambdaException',
                            'Lambda.SdkClientException',
                            'Lambda.TooManyRequestsException',
                        ],
                        IntervalSeconds: 2,
                        MaxAttempts: 6,
                        BackoffRate: 2,
                    },
                ],
            },
        );

        const endState = new Pass(this, 'End');

        const isBatchCompleteChoice = new Choice(this, 'isBatchComplete')
            .when(
                isBatchCompleteCondition,
                processOutputResults.next(aggregate),
            )
            .otherwise(endState);

        const choice = new Choice(this, 'Choice')
            .when(
                condition,
                initializeProcessor.next(map).next(isBatchCompleteChoice),
            )
            .otherwise(wait.next(listExecutions));

        /* Step Function State Machine */
        new BaseStepFunction(this, stateMachineName, {
            stateMachineName: stateMachineName,
            definitionBody: DefinitionBody.fromChainable(
                listExecutions.next(passState).next(choice),
            ),
            role: props.iamRole,
        });
    }
}
