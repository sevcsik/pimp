export { Command, AnyBuiltinCommand } from './commands'
export { Event } from './events'
export { Intent, AnyBuiltinIntent } from './intents'
export { Reply, AnyBuiltinReply } from './replies'
export { mkWebsocketClientDriver } from './websocketClientDriver'

import { AnyBuiltinCommand, Command, GetState as GetStateCommand } from './commands'
import { Event } from './events'
import { Intent, AnyBuiltinIntent } from './intents'
import { AnyBuiltinReply, CommandRejected, Reply, State as StateReply } from './replies'
import { mkExecuteIntent, ExecuteIntentFn } from './executeIntent'
import { mkValidateCommand, ValidateCommandFn } from './validateCommand'

import { DOMSource } from '@cycle/dom/lib/es6/rxjs';
import { VNode } from '@cycle/dom'
import { iteratee } from 'lodash/fp'
import { Observable, merge, of } from 'rxjs'
import { map, filter, scan, startWith, withLatestFrom } from 'rxjs/operators'
import { tag } from 'rxjs-spy/operators'

export interface DetermineIntentsFn<AnyIntent> {
    (dom: DOMSource): Observable<AnyIntent>
}

export interface MainFn<IncomingMessage, OutgoingMessage> {
    (sources: Sources<IncomingMessage>): Sinks<OutgoingMessage>
}

export interface MkStateFn<ServerState, ClientState> {
    (serverState: ServerState | null): ClientState
}

export interface ReducerFn<AnyEvent, AnyReply, ServerState, ClientState, ValidationFailureReason> {
    ( state: ClientState
    , message: AnyEvent | AnyReply | AnyBuiltinReply<ServerState, ValidationFailureReason>
    ): ClientState
}

export interface RenderStateFn<ClientState> {
    (state: ClientState): VNode
}

export interface Sources<IncomingMessage> { ws: Observable<IncomingMessage>
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
    , ServerState
    , ClientState
    >
    ( determineIntents: DetermineIntentsFn<AnyIntent>
    , executeIntent: ExecuteIntentFn<AnyIntent, AnyCommand>
    , validateCommand: ValidateCommandFn<AnyCommand, ValidationFailureReason>
    , reducer: ReducerFn<AnyEvent, AnyReply, ServerState, ClientState, ValidationFailureReason>
    , mkState: MkStateFn<ServerState, ClientState>
    , renderState: RenderStateFn<ClientState>
    ): MainFn< AnyEvent | AnyReply | AnyBuiltinReply<ServerState, ValidationFailureReason>
             , AnyCommand | AnyBuiltinCommand
             > {

    type IncomingMessage = AnyReply | AnyBuiltinReply<ServerState, ValidationFailureReason> | AnyEvent

    return ({ ws, dom }: Sources<IncomingMessage>)
        : Sinks<AnyCommand | AnyBuiltinCommand> => {

        const domIntents$ = determineIntents(dom)

        const intents$ = domIntents$
            .pipe(startWith({ _type: 'intent', name: 'builtin view' }))
            .pipe(tag(`${tp}:intents`))

        const executeIntentWithBuiltins = mkExecuteIntent(executeIntent)
        const commands$ = (intents$
            .pipe(map(executeIntentWithBuiltins))
            .pipe(filter(command => command !== null)) as Observable<AnyCommand | AnyBuiltinCommand>)
            .pipe(tag(`${tp}:commands`))

        const validateCommandWithBuiltins = mkValidateCommand(validateCommand)
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
                ({ _type: 'reply', command, name: 'command rejected', reason: validationResult } as
                    CommandRejected<ValidationFailureReason>)
            ))
            .pipe(tag(`${tp}:clientSideReplies`))

        const serverSideReplies$ = ws
            .pipe(filter((message): message is AnyReply | AnyBuiltinReply<ServerState, ValidationFailureReason> =>
                message._type === 'reply'
            ))
            .pipe(tag(`${tp}:serverSideReplies`))

        const replies$ = merge(clientSideReplies$, serverSideReplies$)
        const events$ = ws.pipe(filter((m: any): m is AnyEvent => m._type === 'event'))
        const state$ = merge(events$, intents$, replies$)
            .pipe(scan<IncomingMessage, ClientState>((state, msg) => {
                const isStateReply = (m: any): m is StateReply<ServerState> =>
                    msg._type === 'reply' && msg.name === 'state'
                return isStateReply(msg) ? mkState(msg.state) : reducer(state, msg)
            }, mkState(null)))
            .pipe(startWith(mkState(null)))
            .pipe(tag(`${tp}:state`))

        const dom$ = state$.pipe(map(renderState))

        return { ws: validCommands$, dom: dom$ }
    }
}
