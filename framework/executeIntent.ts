import { Command, AnyBuiltinCommand, mkBuiltinCommand } from './commands'
import { Intent, AnyBuiltinIntent } from './intents'

export interface ExecuteIntentFn<AnyIntent, AnyCommand> {
    (intent: AnyIntent): AnyCommand | null
}

export function mkExecuteIntent
    <AnyIntent extends Intent, AnyCommand extends Command>
    (executeIntent: ExecuteIntentFn<AnyIntent, AnyCommand>)
    : ExecuteIntentFn<AnyIntent | AnyBuiltinIntent, AnyCommand | AnyBuiltinCommand> {

    return intent => intent.name === 'builtin view'
                   ? mkBuiltinCommand('get state')
                   : executeIntent(intent as AnyIntent)
}
