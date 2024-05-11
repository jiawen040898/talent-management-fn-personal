import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import { initSentryMiddleware, loggerMiddleware } from '@pulsifi/fn';
import * as Sentry from '@sentry/serverless';
import { Handler } from 'aws-lambda';

import { version } from '../package.json';

initSentryMiddleware(version);

export const eventMiddleware = (handler: Handler): Handler =>
    Sentry.AWSLambda.wrapHandler(
        middy(handler).use([
            doNotWaitForEmptyEventLoop({ runOnError: true }),
            loggerMiddleware(),
        ]),
        {
            timeoutWarningLimit: 5.5,
        },
    );
