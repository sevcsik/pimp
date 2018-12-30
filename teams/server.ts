import { initApi } from './api'
import { WSCommand } from './api/common'
import { Command } from './domain/common'

import { defaults, extend } from 'lodash/fp'
import { create as createSpy } from 'rxjs-spy'
import { Observable } from 'rxjs'
import * as WebSocket from 'ws'

const spy = createSpy()
spy.log(/.+/)

const options = defaults(
	{ port: 8000, host: 'localhost' },
	{ port: process.env['PIMP_PORT'], host: process.env['PIMP_HOST'] }
)

const server = new WebSocket.Server(options)

const isSocketOpen = (client: WebSocket) => client.readyState === WebSocket.OPEN

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

const { events$, replies$ } = initApi(messages$)

events$.subscribe(event => {
	server.clients.forEach(client => {
		isSocketOpen(client) && client.send(JSON.stringify(event))
	})
})

replies$.subscribe(reply => {
	isSocketOpen(reply.to) && reply.to.send(JSON.stringify(reply.reply))
})


