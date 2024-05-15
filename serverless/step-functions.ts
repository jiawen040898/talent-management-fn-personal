export const stepFunctions = {
    stateMachines: {
        feedbackRecommendationGenerator: {
            name: 'feedbackRecommendationGenerator',
            definition: {
                Comment: 'Feedback Recommendation Generation Request',
                StartAt: 'ListExecutions',
                States: {
                    ListExecutions: {
                        Type: 'Task',
                        Next: 'Pass',
                        Parameters: {
                            StateMachineArn:
                                'arn:aws:states:${aws:region}:${aws:accountId}:stateMachine:feedbackRecommendationGenerator',
                            StatusFilter: 'RUNNING',
                        },
                        Resource: 'arn:aws:states:::aws-sdk:sfn:listExecutions',
                        ResultPath: '$.StateInfo',
                    },
                    Pass: {
                        Type: 'Pass',
                        Next: 'Choice',
                        Parameters: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'Records.$': '$.Records',
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'Executions.$': '$.StateInfo.Executions',
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'ExecutionLastQueued.$':
                                '$.StateInfo.Executions[-1:]',
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'totalExecutions.$':
                                'States.ArrayLength($.StateInfo.Executions)',
                        },
                    },
                    Choice: {
                        Type: 'Choice',
                        Choices: [
                            {
                                And: [
                                    {
                                        Variable:
                                            '$.ExecutionLastQueued[0].Name',
                                        StringEqualsPath: '$$.Execution.Name',
                                    },
                                ],
                                Next: 'InitializeProcessor',
                            },
                        ],
                        Default: 'Wait',
                    },
                    Wait: {
                        Type: 'Wait',
                        Seconds: 15,
                        Next: 'ListExecutions',
                    },
                    InitializeProcessor: {
                        Type: 'Task',
                        Resource: 'arn:aws:states:::lambda:invoke',
                        Parameters: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'Payload.$': '$',
                            FunctionName:
                                'arn:aws:lambda:${aws:region}:${aws:accountId}:function:talent-management-feedback-recommendation-process-request-fn:$LATEST',
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
                        Next: 'Map',
                        OutputPath: '$.Payload',
                    },
                    Map: {
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
                                                Resource:
                                                    'arn:aws:states:::lambda:invoke',
                                                OutputPath: '$.Payload',
                                                Parameters: {
                                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                                    'Payload.$': '$',
                                                    FunctionName:
                                                        'arn:aws:lambda:${aws:region}:${aws:accountId}:function:talent-management-feedback-recommendation-generation-request-fn:$LATEST',
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
                                    ItemSelector: {
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        'Item.$': '$$.Map.Item.Value',
                                    },
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
                        Next: 'isBatchComplete',
                        ItemBatcher: {
                            MaxItemsPerBatch: 1,
                        },
                        Label: 'Map',
                        ResultSelector: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'data.$': '$',
                            // eslint-disable-next-line @typescript-eslint/naming-convention
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
                    },
                    isBatchComplete: {
                        Type: 'Choice',
                        Choices: [
                            {
                                Variable: '$.resultCount',
                                NumericGreaterThan: 0,
                                Next: 'ProcessOutputResults',
                            },
                        ],
                        Default: 'End',
                    },
                    ProcessOutputResults: {
                        Type: 'Pass',
                        Next: 'Aggregate',
                        Parameters: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'data.$': '$.data[*][*]',
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'feedback_cycle_reviewee_id.$':
                                '$.data[0][0].feedback_cycle_reviewee_id',
                        },
                    },
                    End: {
                        Type: 'Pass',
                        End: true,
                    },
                    Aggregate: {
                        Type: 'Task',
                        Resource: 'arn:aws:states:::lambda:invoke',
                        Parameters: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'Payload.$': '$',
                            FunctionName:
                                'arn:aws:lambda:${aws:region}:${aws:accountId}:function:talent-management-feedback-recommendation-ended-request-fn:$LATEST',
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
                        End: true,
                    },
                },
            },
            role: 'arn:aws:iam::${aws:accountId}:role/talent-management-feedback-fn-role',
        },
    },
};
