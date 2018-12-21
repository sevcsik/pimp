import { initApi } from './api'
import { WSCommand } from './api/common'
import { Command } from './domain/common'

import { defaults } from 'lodash/fp'
import { Observable } from 'rxjs'
import * as WebSocket from 'ws'

const options = defaults(
	{ port: 8000, host: 'localhost' },
	{ port: process.env['PIMP_PORT'], host: process.env['PIMP_HOST'] }
)

const server = new WebSocket.Server(options)

const messages$: Observable<WSCommand> = new Observable((observer) => {
	server.on('connection', (client: WebSocket) => {
		client.on('message', rawMessage => {
			try {
				const command = JSON.parse(rawMessage.toString()) as Command
				observer.next({ from: client, command })
			} catch (e) {
				client.send(JSON.stringify({ error: "invalid json", data: rawMessage, exception: e.message }))
			}
		})
	})
})

initApi(messages$)

