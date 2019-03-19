import { AnyCommand } from '../../shared/commands';
import { AnyIntent } from '../../shared/intents';

declare function assertNever(n: never): never;

export const executeIntents = (intent: AnyIntent): AnyCommand | null => {
    switch (intent.name) {
        case 'create':
        case 'edit':
            return null;
        case 'remove':
        case 'save':
            throw new Error(`Intent not implemented: ${intent.name}`);
        default:
            return assertNever(intent);
    }
};
