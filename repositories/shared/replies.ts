import { Command } from './commands'

export interface Reply { _type: 'reply', command: Command }

namespace Replies {
    export interface CommandAccepted extends Reply { name: 'command accepted' }
    export interface CommandRejected extends Reply { name: 'command rejected', reason: string }
    export interface CommandInvalid extends CommandRejected { reason: 'invalid fields'
                                                            , validationErrors: ReadonlyArray<ValidationError>
                                                            }
}

export type AnyReply = Replies.CommandAccepted
                     | Replies.CommandInvalid
                     | Replies.CommandRejected

export interface ValidationError { field: string, reason: string }
