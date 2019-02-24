export { Command } from './commands'
export { Event } from './events'
export { Reply } from './replies'

import { AnyBuiltinCommand, Command } from './commands'
import { Event } from './events'
import { AnyBuiltinReply, Reply, State as StateReply } from './replies'
import { mkValidateCommand, ValidateCommandFn } from './validateCommand'

import { Observable, merge } from 'rxjs'
import { map, filter, scan, startWith, withLatestFrom } from 'rxjs/operators'
import { create as createSpy } from 'rxjs-spy'
import { tag } from 'rxjs-spy/operators'
import { defaults, isNull, iteratee, negate } from 'lodash/fp'
import * as WebSocket from 'ws'

export interface ExecuteCommandFn<AnyCommand, AnyEvent> {
    (command: AnyCommand): (AnyEvent | null)
}

export interface MainFn<AnyCommand, AnyEvent, AnyReply> {
    (sources: Sources<AnyCommand>): Sinks<AnyEvent, AnyReply>
}

export interface ReducerFn<AnyEvent, State> {
    (state: State, event: AnyEvent): State
}

export interface Sources<AnyCommand> { ws: Observable<AnyCommand> }
export interface Sinks<AnyEvent, AnyReply> { ws: Observable<AnyEvent | AnyReply> }

export interface ValidateCommandFn<AnyCommand, ValidationFailureReason> {
    (command: AnyCommand): ValidationFailureReason | null
}

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

    return ({ ws }: Sources<AnyCommand | AnyBuiltinCommand>)
        : Sinks<AnyEvent, AnyReply | AnyBuiltinReply<State, ValidationFailureReason>> => {

        const validateCommandWithBuiltins = mkValidateCommand(validateCommand)
        const replies$ = ws
            .pipe(map(command => {
                const validationResult = validateCommandWithBuiltins(command)
                return validationResult === null
                    ? { _type: 'reply', command, name: 'command accepted' }
                    : { _type: 'reply', command, name: 'command rejected', reason: validationResult }
            }))

        const validCommands$ = ws
            .pipe(filter(command => validateCommandWithBuiltins(command) === null))

        const events$ = validCommands$
            .pipe(map(executeCommand))
            .pipe(filter(negate(isNull)))

        const state$ = events$
            .pipe(startWith(initialState))
            .pipe(scan(reducer))

        const stateReplies$ = validCommands$
            .pipe(filter(cmd => cmd.name === 'get state'))
            .pipe(withLatestFrom(state$))
            .pipe(tag('server:getStateCommands'))
            .pipe(map(([ command, state ]) => (
                { _type: 'reply', command, name: 'state', state } as StateReply<State>))
            )

        return { ws: merge(events$, replies$, stateReplies$) }
    }
}
