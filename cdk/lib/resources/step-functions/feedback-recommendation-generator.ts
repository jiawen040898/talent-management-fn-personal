/* eslint-disable @typescript-eslint/naming-convention */
import { Duration } from 'aws-cdk-lib';
import {
    Choice,
    Condition,
    Pass,
    Wait,
    WaitTime,
} from 'aws-cdk-lib/aws-stepfunctions';
import type { Construct } from 'constructs';

import { BaseStepFunction } from '../../base';
import { accountId, region } from '../../variables';
import type { FunctionGroupResources } from '../functions';

export const feedbackRecommendationDefinitionBody = (
    scope: Construct,
    functionGroupResources: FunctionGroupResources,
) => {
    /* Step Function State */
    const listExecutions = BaseStepFunction.stepFunctionCustomState(
        scope,
        'ListExecutions',
        {
            Type: 'Task',
            Resource: 'arn:aws:states:::aws-sdk:sfn:listExecutions',
            Parameters: {
                StateMachineArn: `arn:aws:states:${region}:${accountId}:stateMachine:feedbackRecommendationGenerator`,
                StatusFilter: 'RUNNING',
            },
            ResultPath: '$.StateInfo',
        },
    );

    const passState = new Pass(scope, 'Pass', {
        parameters: {
            'Records.$': '$.Records',
            'Executions.$': '$.StateInfo.Executions',
            'ExecutionLastQueued.$': '$.StateInfo.Executions[-1:]',
            'totalExecutions.$': 'States.ArrayLength($.StateInfo.Executions)',
        },
    });

    const wait = new Wait(scope, 'Wait', {
        time: WaitTime.duration(Duration.seconds(15)),
    });

    const condition = Condition.and(
        Condition.stringEqualsJsonPath(
            '$.ExecutionLastQueued[0].Name',
            '$$.Execution.Name',
        ),
    );

    const initializeProcessor = BaseStepFunction.stepFunctionCustomState(
        scope,
        'InitializeProcessor',
        {
            Type: 'Task',
            Resource: 'arn:aws:states:::lambda:invoke',
            Parameters: {
                'Payload.$': '$',
                FunctionName: `${functionGroupResources.talentManagementFeedbackRecommendationProcessRequestFn.functionArn}:$LATEST`,
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

    const map = BaseStepFunction.stepFunctionCustomState(scope, 'Map', {
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
                                    FunctionName: `${functionGroupResources.talentManagementFeedbackRecommendationGenerationRequestFn.functionArn}:$LATEST`,
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

    const processOutputResults = new Pass(scope, 'ProcessOutputResults', {
        parameters: {
            'data.$': '$.data[*][*]',
            'feedback_cycle_reviewee_id.$':
                '$.data[0][0].feedback_cycle_reviewee_id',
        },
    });

    const aggregate = BaseStepFunction.stepFunctionCustomState(
        scope,
        'Aggregate',
        {
            Type: 'Task',
            Resource: 'arn:aws:states:::lambda:invoke',
            Parameters: {
                'Payload.$': '$',
                FunctionName: `${functionGroupResources.processFeedbackRecommendationEndedRequest.functionArn}:$LATEST`,
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

    const endState = new Pass(scope, 'End');

    const isBatchCompleteChoice = new Choice(scope, 'isBatchComplete')
        .when(isBatchCompleteCondition, processOutputResults.next(aggregate))
        .otherwise(endState);

    const choice = new Choice(scope, 'Choice')
        .when(
            condition,
            initializeProcessor.next(map).next(isBatchCompleteChoice),
        )
        .otherwise(wait.next(listExecutions));

    const startState = listExecutions.next(passState).next(choice);

    return startState;
};
