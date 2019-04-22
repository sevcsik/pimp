import { AnyEvent } from '../../shared/events'
import { AnyIntent } from '../../shared/intents'
import { AnyReply } from '../../shared/replies'
import { CreateRepository } from '../../shared/commands'
import { ValidationFailureReason, InvalidField } from '../../shared/validateCommand'
import { initialState
       , State as ServerState
       , reducer as eventReducer
       } from '../../shared/state'
import { Repository, RepositoryFields, RepositoryId } from '../../shared/objects'

import { AnyBuiltinIntent, AnyBuiltinReply } from '@pimp/framework/client'
import { drop, find, findIndex, take } from 'lodash/fp'

declare function assertNever(x: never): never

export interface UnsavedRepository { id: RepositoryId | null
                                   , fields: RepositoryFields
                                   , fieldValidationErrors: ReadonlyArray<InvalidField>
                                   }

export interface State extends ServerState { unsavedRepositories: ReadonlyArray<UnsavedRepository> }

export const mkState = (state: ServerState | null): State => ({ ...(state !== null ? state : initialState)
                                                              , unsavedRepositories: []
                                                              })

const intentReducer = (state: State, intent: AnyIntent | AnyBuiltinIntent) => {
    switch (intent.name) {
        case 'create':
            return { ...state
                   , unsavedRepositories: [ ...state.unsavedRepositories
                                          , { id: 'new'
                                            , fields: { name: '', provider: 'bitbucket' }
                                            , fieldValidationErrors: []
                                            } as UnsavedRepository
                                          ]
                  }
        case 'edit':
            const repository = find({ id: intent.id }, state.repositories)
            if (repository !== undefined) {
                return { ...state
                       , unsavedRepositories: [ ...state.unsavedRepositories
                                              , { id: intent.id
                                                , fields: {name: repository.name, provider: repository.provider }
                                                , fieldValidationErrors: []
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

const replyReducer = (state: State, message: AnyReply | AnyBuiltinReply<ServerState, ValidationFailureReason>) => {
    switch (message.name) {
        case 'command rejected':
            switch (message.command.name) {
                case 'update repository':
                case 'create repository':
                    // TODO: message.command should be AnyCommand, so no casting is necessary
                    const cmd = message.command as CreateRepository
                    switch (message.reason._type) {
                        case 'invalid fields':
                            // TODO: we should match with something more unique
                            const unsavedRepositoryIndex = findIndex( repo => repo.fields.name === cmd.fields.name
                                                                    , state.unsavedRepositories
                                                                    )
                            if (unsavedRepositoryIndex === -1) throw new Error('Cannot find repository for reply')
                            const unsavedRepository = { ...state.unsavedRepositories[unsavedRepositoryIndex]
                                                      , fieldValidationErrors: message.reason.invalidFields
                                                      }
                            const originalUnsavedRepositories = state.unsavedRepositories
                            const unsavedRepositories =
                                [ ...take(unsavedRepositoryIndex, originalUnsavedRepositories)
                                , unsavedRepository
                                , ...drop(unsavedRepositoryIndex + 1, originalUnsavedRepositories)
                                ]
                            return { ...state, unsavedRepositories }

                        default: throw new Error('Unknown rejection reason: ' + message.reason._type)
                    }
                default: throw new Error('Unknown command rejected: ' + message.command.name)
            }
        default: return state // we don't need to handle builtins
    }
}

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
