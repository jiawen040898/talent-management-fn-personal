/* Reference: https://gist.github.com/zirkelc/084fcec40849e4189749fd9076d5350c */
import type { IRole } from 'aws-cdk-lib/aws-iam';

import type { FunctionGroupResources } from '../resources/functions';

export interface StepFunctionResourceProps {
    iamRole: IRole;
    functionGroupResources: FunctionGroupResources;
}

export interface StepFunction {
    stateMachines: StateMachines;
    validate?: boolean;
}

type StateMachines = {
    [stateMachine: string]: {
        id?: string;
        name: string;
        definition: Definition;
        role?: string;
        tracingConfig?: TracingConfig;
    };
};

type TracingConfig = {
    enabled: boolean;
};

type Definition = {
    Comment?: string;
    StartAt: string;
    States: States;
};

type StateTypes = Choice | Fail | Map | Task | Parallel | Pass | Wait;

export type States =
    | {
          [state: string]: StateTypes;
      }
    | StateTypes;

type StateBase = {
    Catch?: Catcher[];
    Retry?: Retrier[];
    End?: boolean;
    InputPath?: string;
    Next?: string;
    OutputPath?: string;
    ResultPath?: string;
    ResultSelector?: { [key: string]: string | { [key: string]: string } };
    Type: string;
    Comment?: string;
};

type ChoiceRuleComparison = {
    Variable: string;
    BooleanEquals?: number;
    BooleanEqualsPath?: string;
    IsBoolean?: boolean;
    IsNull?: boolean;
    IsNumeric?: boolean;
    IsPresent?: boolean;
    IsString?: boolean;
    IsTimestamp?: boolean;
    NumericEquals?: number;
    NumericEqualsPath?: string;
    NumericGreaterThan?: number;
    NumericGreaterThanPath?: string;
    NumericGreaterThanEquals?: number;
    NumericGreaterThanEqualsPath?: string;
    NumericLessThan?: number;
    NumericLessThanPath?: string;
    NumericLessThanEquals?: number;
    NumericLessThanEqualsPath?: string;
    StringEquals?: string;
    StringEqualsPath?: string;
    StringGreaterThan?: string;
    StringGreaterThanPath?: string;
    StringGreaterThanEquals?: string;
    StringGreaterThanEqualsPath?: string;
    StringLessThan?: string;
    StringLessThanPath?: string;
    StringLessThanEquals?: string;
    StringLessThanEqualsPath?: string;
    StringMatches?: string;
    TimestampEquals?: string;
    TimestampEqualsPath?: string;
    TimestampGreaterThan?: string;
    TimestampGreaterThanPath?: string;
    TimestampGreaterThanEquals?: string;
    TimestampGreaterThanEqualsPath?: string;
    TimestampLessThan?: string;
    TimestampLessThanPath?: string;
    TimestampLessThanEquals?: string;
    TimestampLessThanEqualsPath?: string;
};

type ChoiceRuleNot = {
    Not: ChoiceRuleComparison;
    Next: string;
};

type ChoiceRuleAnd = {
    And: ChoiceRuleComparison[];
    Next: string;
};

type ChoiceRuleOr = {
    Or: ChoiceRuleComparison[];
    Next: string;
};

type ChoiceRuleSimple = ChoiceRuleComparison & {
    Next: string;
};

type ChoiceRule =
    | ChoiceRuleSimple
    | ChoiceRuleNot
    | ChoiceRuleAnd
    | ChoiceRuleOr;

interface Choice extends StateBase {
    Type: 'Choice';
    Choices: ChoiceRule[];
    Default?: string;
}

interface Fail extends StateBase {
    Type: 'Fail';
    Cause?: string;
    Error?: string;
}

interface Map extends StateBase {
    Type: 'Map';
    ItemsPath?: string;
    Iterator?: Definition;
    ItemProcessor?: ItemProcessor;
    ItemSelector?: ItemSelector;
    Label?: string;
    ItemBatcher?: ItemBatcher;
    ItemReader?: ItemReader;
    MaxConcurrency?: number;
    ToleratedFailureCount?: number;
}

interface ItemProcessor {
    ProcessorConfig: ProcessorConfig;
    StartAt: string;
    States: State;
}
interface ItemSelector {
    [key: string]: string;
}

interface ProcessorConfig {
    Mode: string;
    ExecutionType?: string;
}

interface State {
    [key: string]: Task | Map;
}

interface ItemBatcher {
    MaxItemsPerBatch: number;
}

interface ItemReader {
    Resource: string;
    ReaderConfig: {
        InputType: string;
    };
    Parameters: {
        [key: string]: string;
    };
}

type Resource =
    | string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    | { 'Fn::GetAtt': [string, 'Arn'] }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    | { 'Fn::Join': [string, Resource[]] };

interface TaskParametersForLambda {
    FunctionName?: Resource;
    Payload?: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'token.$': string;
        [key: string]: string;
    };
    [key: string]: unknown;
}

interface TaskParametersForStepFunction {
    StateMachineArn: Resource;
    Input?: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'AWS_STEP_FUNCTIONS_STARTED_BY_EXECUTION_ID.$': '$$.Execution.Id';
        [key: string]: string;
    };
    Retry?: [{ ErrorEquals?: string[] }];
    End?: boolean;
}

interface Task extends StateBase {
    Type: 'Task';
    Resource: Resource;
    OutputPath?: string;
    Parameters?:
        | TaskParametersForLambda
        | TaskParametersForStepFunction
        | { [key: string]: string | { [key: string]: string } };
}

interface Pass extends StateBase {
    Type: 'Pass';
    Parameters?: {
        [key: string]: string | Array<unknown> | { [key: string]: string };
    };
}

interface Parallel extends StateBase {
    Type: 'Parallel';
    Branches: Definition[];
}

interface Wait extends StateBase {
    Type: 'Wait';
    Next?: string;
    Seconds: number;
}

type Catcher = {
    ErrorEquals: ErrorName[] | string[];
    Next: string;
    ResultPath?: string;
};

type Retrier = {
    ErrorEquals: string[];
    IntervalSeconds?: number;
    MaxAttempts?: number;
    BackoffRate?: number;
    JitterStrategy?: string;
};

type ErrorName =
    | 'States.ALL'
    | 'States.DataLimitExceeded'
    | 'States.Runtime'
    | 'States.Timeout'
    | 'States.TaskFailed'
    | 'States.Permissions';
