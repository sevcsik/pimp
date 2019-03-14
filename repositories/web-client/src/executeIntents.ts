import { AnyCommand } from '../../shared/commands';
import { AnyIntent } from '../../shared/intents';

export const executeIntents = (intent: AnyIntent): AnyCommand | null => {
    switch (intent.name) {
        case 'edit':
            return null;
        default:
            throw new Error(`Unknown intent: ${intent.name}`);
    }
};
