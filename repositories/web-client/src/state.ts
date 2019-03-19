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

import { AnyBuiltinReply, ReducerFn } from '@pimp/framework/client';

export interface UnsavedRepository {
    id: RepositoryId;
    fields: RepositoryFields;
}
export interface State extends ServerState {
    unsavedRepositories: ReadonlyArray<UnsavedRepository>;
}

export const mkState = (state: ServerState | null): State => ({
    ...(state !== null ? state : initialState),
    unsavedRepositories: []
});

const intentReducer = (state: State, message: AnyIntent) => {
    return state;
};

const replyReducer = (
    state: State,
    message: AnyReply | AnyBuiltinReply<ServerState, ValidationFailureReason>
) => state;

declare function assertNever(x: never): never;

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
