import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { logger } from '@pulsifi/fn';
import { SQSEvent } from 'aws-lambda';

import * as AWSConfig from '../configs';
import { eventMiddleware } from '../middleware';

export const handleEvent = async (event: SQSEvent) => {
    try {
        logger.info(
            'Receive feedback cycle recommendation generation initialize request from SQS',
            {
                event,
            },
        );

        const stateMachineConfig = AWSConfig.stateMachine();

        const stepFunctionService = new SFNClient({
            region: stateMachineConfig.region,
        });

        const stateMachineParams = {
            stateMachineArn: stateMachineConfig.stateMachineName,
            input: JSON.stringify(event),
        };

        const startExecutionCommand = new StartExecutionCommand(
            stateMachineParams,
        );

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await stepFunctionService.send(startExecutionCommand);
    } catch (error) {
        logger.error(
            'Fail to process feedback cycle recommendation generation initialize request from SQS',
            {
                data: event,
            },
        );
        throw error;
    }
};

export const handler = eventMiddleware(handleEvent);
