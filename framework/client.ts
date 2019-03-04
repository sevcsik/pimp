export { Command } from './commands'
export { Event } from './events'
export { Intent } from './intents'
export { Reply } from './replies'
export { mkWebsocketClientDriver } from './websocketClientDriver'

import { AnyBuiltinCommand, Command, GetState as GetStateCommand } from './commands'
import { Event } from './events'
import { Intent, AnyBuiltinIntent } from './intents'
import { AnyBuiltinReply, Reply, State as StateReply } from './replies'
import { mkExecuteIntent, ExecuteIntentFn } from './executeIntent'
import { mkValidateCommand, ValidateCommandFn } from './validateCommand'

import { DOMSource } from '@cycle/dom/lib/es6/rxjs';
import { VNode } from '@cycle/dom'
import { Observable, merge, of } from 'rxjs'
import { map, filter, scan, startWith, withLatestFrom } from 'rxjs/operators'
import { tag } from 'rxjs-spy/operators'

export interface MainFn<AnyCommand, AnyEvent, AnyReply> {
    (sources: Sources<AnyReply, AnyEvent>): Sinks<AnyCommand>
}

export interface ReducerFn<AnyEvent, State> {
    (state: State, event: AnyEvent): State
}

export interface Sources<AnyReply, AnyEvent> { ws: Observable<AnyReply | AnyEvent>
                                             , dom: DOMSource
                                             }
export interface Sinks<AnyCommand> { ws: Observable<Command>
                                   , dom: Observable<VNode>
                                   }

export interface ValidateCommandFn<AnyCommand, ValidationFailureReason> {
    (command: AnyCommand): ValidationFailureReason | null
}

const tp = 'framework/client'

export function mkMain
    < AnyCommand extends Command
    , AnyEvent extends Event
    , AnyReply extends Reply
    , AnyIntent extends Intent
    , ValidationFailureReason
    , State
    >
    ( executeIntent: ExecuteIntentFn<AnyIntent, AnyCommand>
    , validateCommand: ValidateCommandFn<AnyCommand, ValidationFailureReason>
    , reducer: ReducerFn<AnyEvent, State>
    , initialState: State
    ): MainFn< AnyCommand | AnyBuiltinCommand
             , AnyEvent
             , AnyReply | AnyBuiltinReply<State, ValidationFailureReason>
             > {

    function isReply(message): message is AnyReply | AnyBuiltinReply<State, ValidationFailureReason> {
        return message._type === "reply"
    }

    return ({ ws, dom }: Sources< AnyReply | AnyBuiltinReply<State, ValidationFailureReason>, AnyEvent>)
        : Sinks<AnyCommand | AnyBuiltinCommand> => {

        const validateCommandWithBuiltins = mkValidateCommand(validateCommand)
        const executeIntentWithBuiltins = mkExecuteIntent(executeIntent)

        const intents$ = of({ _type: 'intent', name: 'view page' })
            .pipe(tag(`${tp}:intents`))

        const commands$ = intents$
            .pipe(map(executeIntentWithBuiltins))
            .pipe(filter(command => command !== null))
            .pipe(tag(`${tp}:commands`))

        const commandsWithValidationResult$ = commands$
            .pipe(map(command => ({ command, validationResult: validateCommandWithBuiltins(command) })))
            .pipe(tag(`${tp}:commandsWithValidationResult`))

        const validCommands$ = commandsWithValidationResult$
            .pipe(filter(({ command, validationResult }) => validationResult === null))
            .pipe(map(({ command, validationResult }) => command))
            .pipe(tag(`${tp}:validCommands`))

        const clientSideReplies$ = commandsWithValidationResult$
            .pipe(filter(({ command, validationResult }) => validationResult !== null))
            .pipe(map(({ command, validationResult }) =>
                ({ _type: 'reply', command, name: 'command rejected', reason: validationResult })
            ))
            .pipe(tag(`${tp}:clientSideReplies`))

        const serverSideReplies$ = ws
            .pipe(filter(isReply))
            .pipe(tag(`${tp}:clientSideReplies`))

        const replies$ = merge(clientSideReplies$, serverSideReplies$)

        return { ws: validCommands$, dom }
    }
}
