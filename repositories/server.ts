import { AnyCommand } from './shared/commands'
import { AnyEvent } from './shared/events'
import { AnyReply, Replies } from './shared/replies'
import { executeCommand } from './shared/executeCommand'
import { makeWebsocketServerDriver } from './drivers/websocketServerDriver'
import { validateCommand } from './shared/validateCommand'
import { reducer, initialState } from './shared/state'

import { run } from '@cycle/rxjs-run'
import { Observable, merge } from 'rxjs'
import { map, filter, scan, startWith, withLatestFrom } from 'rxjs/operators'
import { create as createSpy } from 'rxjs-spy'
import { tag } from 'rxjs-spy/operators'
import { defaults, isNull, iteratee, negate } from 'lodash/fp'
import * as WebSocket from 'ws'

type Sinks = { ws: Observable<AnyEvent | AnyReply> }
type Sources = { ws: Observable<AnyCommand> }

const main = ({ ws }: Sources): Sinks => {
    const replies$ = ws
        .pipe(map(command => {
            const validationResult = validateCommand(command)
            return validationResult === null
                ? { _type: 'reply', command, name: 'command accepted' }
                : { _type: 'reply', command, name: 'command rejected', reason: validationResult }
        }))

    const validCommands$ = ws
        .pipe(filter(cmd => validateCommand(cmd) === null))

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
        .pipe(map(([ command, state ]) => ({ _type: 'reply', command, name: 'state', state } as Replies.State)))

    return { ws: merge(events$, replies$, stateReplies$) }

}

const onConnection = (client: WebSocket) => {
    const drivers = {
        ws: makeWebsocketServerDriver<AnyCommand, AnyEvent | AnyReply>(client)
    }

    run(main, drivers)
}

const serverOptions = defaults(
    { port: 8001, host: 'localhost' },
    { port: process.env['PIMP_REPOSITORIES_PORT'], host: process.env['PIMP_REPOSITORIES_HOST'] }
)

const server = new WebSocket.Server(serverOptions)
server.on('connection', onConnection)
createSpy().log()
