import { Command, Reply } from '@pimp/framework/cjs/server'
import { ValidationFailureReason } from './validateCommand'

export interface CommandAccepted extends Reply { name: 'command accepted' }
export interface CommandRejected extends Reply { name: 'command rejected', reason: ValidationFailureReason }

export type AnyReply = CommandAccepted
                     | CommandRejected
