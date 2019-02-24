import { AnyBuiltinCommand, Command } from './commands'

export interface ValidateCommandFn<AnyCommand, ValidationFailureReason> {
    (command: AnyCommand): ValidationFailureReason | null
}

export function mkValidateCommand
    <AnyCommand extends Command, ValidationFailureReason>
    (validateCommand: ValidateCommandFn<AnyCommand, ValidationFailureReason>)
    : ValidateCommandFn<AnyCommand | AnyBuiltinCommand, ValidationFailureReason> {
        return command => command.name === 'get state' ? null : validateCommand(command as AnyCommand)
}
