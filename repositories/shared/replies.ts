import { Command } from './commands'
import { State as StateContent} from './state'

export interface Reply { _type: 'reply', command: Command }

export namespace Replies {
    export interface CommandAccepted extends Reply { name: 'command accepted' }
    export interface CommandRejected extends Reply { name: 'command rejected', reason: string }
    export interface CommandInvalid extends CommandRejected { reason: 'invalid fields'
                                                            , validationErrors: ReadonlyArray<ValidationError>
                                                            }
    export interface State extends Reply { command: Command, name: 'state', state: StateContent }
}

export type AnyReply = Replies.CommandAccepted
                     | Replies.CommandInvalid
                     | Replies.CommandRejected
                     | Replies.State

export interface ValidationError { field: string, reason: string }
