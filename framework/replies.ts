import { Command } from './commands'

export interface Reply { _type: 'reply', command: Command, name: string }
export interface CommandAccepted extends Reply { name: 'command accepted' }
export interface CommandRejected<ValidationFailureReason> extends Reply {
    name: 'command rejected', reason: ValidationFailureReason
}
export interface State<StateContent> extends Reply { command: Command, name: 'state', state: StateContent }
export type AnyBuiltinReply<StateContent, ValidationFailureReason> = CommandAccepted
                                                                   | CommandRejected<ValidationFailureReason>
                                                                   | State<StateContent>
