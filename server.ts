import { initApi, ClientMessage, ConnectionMessage } from './api'

import { defaults } from 'lodash/fp'
import { Observable } from 'rxjs'
import * as WebSocket from 'ws'

const options = defaults(
	{ port: 8000, host: 'localhost' },
	{ port: process.env['PIMP_PORT'], host: process.env['PIMP_HOST'] }
)

const server = new WebSocket.Server(options)

const messages$: Observable<ClientMessage> = new Observable((observer) => {
	server.on('connection', (client: WebSocket) => {
		observer.next({ client, message: 'connection', args: null })
		client.on('message', rawMessage => {
			try {
				const { message, args } = JSON.parse(rawMessage.toString())
				observer.next({ client, message, args })
			} catch (e) {
				client.send(JSON.stringify({ error: "invalid json", data: rawMessage, exception: e.message }))
			}
		})
	})
})

initApi(messages$)

