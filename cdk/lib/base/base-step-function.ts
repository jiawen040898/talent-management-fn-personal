import {
    CustomResourceTagConstruct,
    CustomStateMachineLogGroupConstruct,
    PulsifiTeam,
} from '@pulsifi/custom-aws-cdk-lib';
import { Tags } from 'aws-cdk-lib';
import {
    CustomState,
    CustomStateProps,
    LogLevel,
    StateMachine,
    StateMachineProps,
} from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';

import { ResourceTag } from '../constants';
import { States } from '../interfaces';
import { environment } from '../variables';

interface BaseStateMachineProps extends StateMachineProps {
    stateMachineName: string;
}

export class BaseStepFunction extends StateMachine {
    constructor(scope: Construct, id: string, props: BaseStateMachineProps) {
        /* Step Function State Machine Log Group */
        const stepFunctionLogGroup = new CustomStateMachineLogGroupConstruct(
            scope,
            `${id}-log-group`,
            {
                awsEnvironment: environment,
                resourceOwner: PulsifiTeam.ENGINEERING,
                stateMachineName: props.stateMachineName,
            },
        );

        /* default step function configuration */
        const defaultStepFunctionConfiguration: StateMachineProps = {
            logs: {
                destination: stepFunctionLogGroup.logGroup,
                includeExecutionData: true,
                level: LogLevel.ALL,
            },
            role: props.role,
            ...props,
        };

        super(scope, id, defaultStepFunctionConfiguration);

        /* tags */
        new CustomResourceTagConstruct(this, `${id}-tagging`, {
            construct: this,
            awsEnvironment: environment,
            resourceOwner: PulsifiTeam.ENGINEERING,
            resourceName: props.stateMachineName,
        });

        Tags.of(scope).add('Type', ResourceTag.STATE_MACHINE);
    }

    static stepFunctionCustomState(
        scope: Construct,
        id: string,
        props: States,
    ) {
        const customStateProps = {
            stateJson: props,
        } as CustomStateProps;

        return new CustomState(scope, id, customStateProps);
    }
}
