export { Command } from './commands'
export { Event } from './events'
export { Reply, State as StateReply } from './replies'
export { mkSharedSubjectEventQueueDriver } from './sharedSubjectEventQueueDriver'
export { mkWebsocketServerDriver } from './websocketServerDriver'

import { AnyBuiltinCommand, Command } from './commands'
import { AnyBuiltinReply, CommandAccepted, CommandRejected, Reply, State as StateReply } from './replies'
import { Event } from './events'
import { mkExecuteCommand, ExecuteCommandFn } from './executeCommand'
import { mkValidateCommand, ValidateCommandFn } from './validateCommand'

import { Observable, merge } from 'rxjs'
import { map, filter, scan, startWith, withLatestFrom } from 'rxjs/operators'
import { tag } from 'rxjs-spy/operators'
import * as WebSocket from 'ws'


export interface MainFn<AnyCommand, AnyEvent, AnyReply> {
    (sources: Sources<AnyCommand, AnyEvent>): Sinks<AnyEvent, AnyReply>
}

export interface ReducerFn<AnyEvent, State> {
    (state: State, event: AnyEvent): State
}

export interface Sources<AnyCommand, AnyEvent> { ws$: Observable<AnyCommand>, events$: Observable<AnyEvent> }
export interface Sinks<AnyEvent, AnyReply> { ws$: Observable<AnyEvent | AnyReply>, events$: Observable<AnyEvent> }

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

    return ({ ws$, events$: externalEvents$ }: Sources<AnyCommand | AnyBuiltinCommand, AnyEvent>)
        : Sinks<AnyEvent, AnyReply | AnyBuiltinReply<State, ValidationFailureReason>> => {

        const validateCommandWithBuiltins = mkValidateCommand(validateCommand)
        const replies$ = ws$
            .pipe(map(command => {
                const validationResult = validateCommandWithBuiltins(command)
                return validationResult === null
                    ? { _type: 'reply', command, name: 'command accepted' } as CommandAccepted
                    : { _type: 'reply', command, name: 'command rejected', reason: validationResult } as
                        CommandRejected<ValidationFailureReason>
            }))

        const validCommands$ = ws$
            .pipe(filter(command => validateCommandWithBuiltins(command) === null))

        const executeCommandWithBuiltins = mkExecuteCommand(executeCommand)
        const events$ = validCommands$
            .pipe(map(executeCommandWithBuiltins))
            .pipe(filter(event => event !== null)) as Observable<AnyEvent> // type inference is not smart enough here :(

        const state$ = merge(events$, externalEvents$)
            .pipe(startWith(initialState))
            .pipe(scan(reducer))

        const stateReplies$ = validCommands$
            .pipe(filter(cmd => cmd.name === 'get state'))
            .pipe(withLatestFrom(state$))
            .pipe(tag('framework/server:getStateCommands'))
            .pipe(map(([ command, state ]) => (
                { _type: 'reply', command, name: 'state', state } as StateReply<State>))
            )

        return { ws$: merge(events$, externalEvents$, replies$, stateReplies$), events$ }
    }
}
