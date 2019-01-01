import { initApi } from './api'
import { WSCommand } from './api/common'
import { Command } from './domain/common'

import { defaults, extendAll } from 'lodash/fp'
import { Observable, Subject } from 'rxjs'
import { share } from 'rxjs/operators'
import { create as createSpy } from 'rxjs-spy'
import { tag } from 'rxjs-spy/operators'
import * as uuid from 'uuid'
import * as WebSocket from 'ws'

//const spy = createSpy()
//spy.log(/api\/index\.ts:initApi:createReplies/)

const options = defaults(
	{ port: 8000, host: 'localhost' },
	{ port: process.env['PIMP_PORT'], host: process.env['PIMP_HOST'] }
)

const server = new WebSocket.Server(options)
const isSocketOpen = (client: WebSocket) => client.readyState === WebSocket.OPEN
const commands$: Subject<WSCommand> = new Subject

server.on('connection', (client: WebSocket) => {
	client.on('message', rawMessage => {
		try {
			const command = extendAll([{}, { id: uuid.v1() }, JSON.parse(rawMessage.toString()) ]) as Command
			commands$.next({ from: client, command })
		} catch (e) {
			client.send(JSON.stringify({ error: "invalid json", data: rawMessage, exception: e.message }))
		}
	})
})

const { events$, replies$ } = initApi(commands$.pipe(tag('server.ts:commands')).pipe(share()))

events$.subscribe(event => {
	server.clients.forEach(client => {
		isSocketOpen(client) && client.send(JSON.stringify(event))
	})
})

replies$.subscribe(reply => {
	isSocketOpen(reply.to) && reply.to.send(JSON.stringify(reply.reply))
})


