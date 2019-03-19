import { AnyEvent } from '../../shared/events'
import { AnyIntent } from '../../shared/intents'
import { AnyReply } from '../../shared/replies'
import { ValidationFailureReason } from '../../shared/validateCommand'
import { initialState
       , State as ServerState
       , reducer as eventReducer
       } from '../../shared/state'
import { Repository, RepositoryFields, RepositoryId } from '../../shared/objects'

import { AnyBuiltinIntent, AnyBuiltinReply } from '@pimp/framework/client'
import { find } from 'lodash/fp'

declare function assertNever(x: never): never

export interface UnsavedRepository {
    id: RepositoryId | null
    fields: RepositoryFields
}

export interface State extends ServerState {
    unsavedRepositories: ReadonlyArray<UnsavedRepository>
}

export const mkState = (state: ServerState | null): State => ({ ...(state !== null ? state : initialState)
                                                              , unsavedRepositories: []
                                                              })

const intentReducer = (state: State, intent: AnyIntent | AnyBuiltinIntent) => {
    switch (intent.name) {
        case 'create':
            return { ...state
                   , unsavedRepositories: [ ...state.unsavedRepositories
                                          , { id: null
                                            , fields: { name: '', provider: 'bitbucket' }
                                            } as UnsavedRepository
                                          ]
                  }
        case 'edit':
            const repository = find({ id: intent.id }, state.repositories)
            if (repository) {
                return { ...state
                       , unsavedRepositories: [ ...state.unsavedRepositories
                                              , { id: intent.id
                                                , fields: {name: repository.name, provider: repository.provider }
                                                }
                                              ]
                       }
            } else {
                throw new Error('Cannot find repository to edit')
            }
        case 'remove':
        case 'save':
        case 'builtin view':
            return state
        default:
            return assertNever(intent)
    }
}

const replyReducer = (state: State, message: AnyReply | AnyBuiltinReply<ServerState, ValidationFailureReason>) => state

export const reducer = ( state: State
                       , message:   AnyEvent
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
        : assertNever(message)
