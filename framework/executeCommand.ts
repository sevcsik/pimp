import { AnyBuiltinCommand, Command } from './commands'
import { Event } from './events'

export interface ExecuteCommandFn<AnyCommand, AnyEvent> {
    (command: AnyCommand): (AnyEvent | null)
}

export function mkExecuteCommand
    <AnyCommand extends Command, AnyEvent extends Event>
    (executeCommand: ExecuteCommandFn<AnyCommand, AnyEvent>)
    : ExecuteCommandFn<AnyCommand | AnyBuiltinCommand, AnyEvent> {
        return command => command.name === 'get state' ? null : executeCommand(command as AnyCommand)
}
