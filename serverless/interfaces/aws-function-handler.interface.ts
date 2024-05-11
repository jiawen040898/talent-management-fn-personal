import { AwsFunctionHandler } from 'serverless/aws';
import { Event, Sqs } from 'serverless/plugins/aws/provider/awsProvider';

interface CustomSqs extends Sqs {
    maximumConcurrency?: number | undefined;
}

interface CustomEvent extends Event {
    sqs?: CustomSqs | undefined;
}

export interface CustomAwsFunctionHandler extends AwsFunctionHandler {
    events?: CustomEvent[] | undefined;
}
