// This polyfill is needed so Observable.of() works on non-RxJS observables (required by Cycle.js).
// It needs to be imported before anything else
import 'symbol-observable'

import { mkMain } from 'framework/server'

import { defaults } from 'lodash/fp'
import { run } from '@cycle/rxjs-run'
import { create as createSpy } from 'rxjs-spy'
import * as WebSocket from 'ws'

import { AnyCommand } from './shared/commands'
import { AnyEvent } from './shared/events'
import { AnyReply } from './shared/replies'
import { executeCommand } from './shared/executeCommand'
import { initialState, reducer, State } from './shared/state'
import { validateCommand, ValidationFailureReason } from './shared/validateCommand'
import { makeWebsocketServerDriver } from './drivers/websocketServerDriver'

const main = mkMain< AnyCommand
                   , AnyEvent
                   , AnyReply
                   , ValidationFailureReason
                   , State
                   >
                   ( validateCommand
                   , executeCommand
                   , reducer
                   , initialState
                   )

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
