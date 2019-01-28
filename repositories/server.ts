import { makeWebsocketServerDriver } from './drivers/websocketServerDriver'
import { Command, Event, Reply } from './shared/domain'

import { run } from '@cycle/rxjs-run'
import { create as createSpy } from 'rxjs-spy'
import { defaults } from 'lodash/fp'
import * as WebSocket from 'ws'

// dummy echo main fn
const main = (drivers: any): any => drivers

const onConnection = (client: WebSocket) => {
    const drivers = {
        ws: makeWebsocketServerDriver<Command, Event | Reply>(client)
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
