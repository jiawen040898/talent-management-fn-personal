import 'jest-extended';
import 'jest-extended/all';

/* eslint-disable @typescript-eslint/no-namespace */
import { BaseException } from '@pulsifi/fn/exceptions';

declare global {
    namespace jest {
        interface Matchers<R> {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
            toMatchExceptionSnapshot<T extends BaseException>(): R;
        }
    }
}

const passed: jest.CustomMatcherResult = {
    pass: true,
    message: (): string => '',
};

const checker = (action: () => void): jest.CustomMatcherResult => {
    try {
        action();

        return passed;
    } catch (e: SafeAny) {
        return {
            pass: false,
            message: (): string => e.matcherResult.message,
        };
    }
};

expect.extend({
    toMatchExceptionSnapshot<T extends BaseException>(
        received: T,
    ): jest.CustomMatcherResult {
        const action = () => {
            expect(received).toMatchSnapshot();
            expect(received.errorDetails).toMatchSnapshot('errorDetails');

            return passed;
        };

        return checker(action);
    },
});

export default undefined;
