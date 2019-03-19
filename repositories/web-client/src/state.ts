import { AnyEvent } from '../../shared/events';
import { AnyIntent } from '../../shared/intents';
import { AnyReply } from '../../shared/replies';
import { ValidationFailureReason } from '../../shared/validateCommand';
import {
    initialState,
    State as ServerState,
    reducer as eventReducer
} from '../../shared/state';
import { RepositoryId, RepositoryFields } from '../../shared/objects';

import { AnyBuiltinIntent, AnyBuiltinReply } from '@pimp/framework/client';

declare function assertNever(x: never): never;

export interface UnsavedRepository {
    id: RepositoryId | null;
    fields: RepositoryFields;
}

export interface State extends ServerState {
    unsavedRepositories: ReadonlyArray<UnsavedRepository>;
}

export const mkState = (state: ServerState | null): State => ({
    ...(state !== null ? state : initialState),
    unsavedRepositories: []
});

const intentReducer = (state: State, intent: AnyIntent | AnyBuiltinIntent) => {
    switch (intent.name) {
        case 'create':
            return {
                ...state,
                unsavedRepositories: [
                    ...state.unsavedRepositories,
                    {
                        id: null,
                        fields: { name: '', provider: 'bitbucket' }
                    } as UnsavedRepository
                ]
            };
        case 'edit':
            throw new Error('Intent not implemented: ' + intent.name);
        case 'remove':
        case 'save':
        case 'builtin view':
            return state;
        default:
            return assertNever(intent);
    }
};

const replyReducer = (
    state: State,
    message: AnyReply | AnyBuiltinReply<ServerState, ValidationFailureReason>
) => state;

export const reducer = (
    state: State,
    message:
        | AnyEvent
        | AnyIntent
        | AnyReply
        | AnyBuiltinReply<ServerState, ValidationFailureReason>
): State =>
    // TODO: this should be in the framework
    message._type === 'event'
        ? { ...state, ...eventReducer(state, message) }
        : message._type === 'intent'
        ? intentReducer(state, message)
        : message._type === 'reply'
        ? replyReducer(state, message)
        : assertNever(message);
