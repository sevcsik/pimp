export { Command } from './commands'
export { Event } from './events'
export { Reply } from './replies'
export { mkWebsocketClientDriver } from './websocketClientDriver'

import { AnyBuiltinCommand, Command, GetState as GetStateCommand } from './commands'
import { AnyBuiltinReply, Reply, State as StateReply } from './replies'
import { Event } from './events'
import { mkExecuteCommand, ExecuteCommandFn } from './executeCommand'
import { mkValidateCommand, ValidateCommandFn } from './validateCommand'

import { Observable, merge, of } from 'rxjs'
import { map, filter, partition, scan, startWith, withLatestFrom } from 'rxjs/operators'
import { tag } from 'rxjs-spy/operators'
import { defaults, isNull, iteratee, negate } from 'lodash/fp'
import * as WebSocket from 'ws'


export interface MainFn<AnyCommand, AnyEvent, AnyReply> {
    (sources: Sources<AnyReply, AnyEvent>): Sinks<AnyCommand>
}

export interface ReducerFn<AnyEvent, State> {
    (state: State, event: AnyEvent): State
}

export interface Sources<AnyReply, AnyEvent> { ws: Observable<AnyReply | AnyEvent> }
export interface Sinks<AnyCommand> { ws: Observable<Command> }

export interface ValidateCommandFn<AnyCommand, ValidationFailureReason> {
    (command: AnyCommand): ValidationFailureReason | null
}

const tp = 'framework/client'

export function mkMain
    < AnyCommand extends Command
    , AnyEvent extends Event
    , AnyReply extends Reply
    , ValidationFailureReason
    , State
    >
    ( validateCommand: ValidateCommandFn<AnyCommand, ValidationFailureReason>
    , executeCommand: ExecuteCommandFn<AnyCommand, AnyEvent>
    , reducer: ReducerFn<AnyEvent, State>
    , initialState: State
    ): MainFn< AnyCommand | AnyBuiltinCommand
             , AnyEvent
             , AnyReply | AnyBuiltinReply<State, ValidationFailureReason>
             > {

    function isReply(message): message is AnyReply | AnyBuiltinReply<State, ValidationFailureReason> {
        return message._type === "reply"
    }

    return ({ ws }: Sources< AnyReply | AnyBuiltinReply<State, ValidationFailureReason>, AnyEvent>)
        : Sinks<AnyCommand | AnyBuiltinCommand> => {

        const validateCommandWithBuiltins = mkValidateCommand(validateCommand)

        // DUMMY
        const outgoingCommands$: Observable<AnyCommand | AnyBuiltinCommand> =
            of({ _id: "asd", _type: "command", name: "get state" } as GetStateCommand)
            .pipe(tag(`${tp}:outgoingCommands`))

        const commandsWithValidationResult$ = outgoingCommands$
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

        return { ws: validCommands$ }
    }
}
