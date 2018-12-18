import { Observable } from 'rxjs'
import { filter } from 'rxjs/operators'
import { iteratee, includes } from 'lodash/fp'
import * as WebSocket from 'ws'

export type WSMessage = { client: WebSocket, message: String, args: any }

export type ConnectionMessage = WSMessage & { message: 'connection' }
export type PingMessage = WSMessage & { message: 'ping' }
export type UnknownMessage = WSMessage

export type ClientMessage = ConnectionMessage
	| PingMessage
	| UnknownMessage

const knownMessages =
	[ 'ping' ]

const matchMessage = (message: String) => iteratee({ message })
const matchUnknown = ({ message }: ClientMessage) => !includes(message, knownMessages)

const initPing = (messages$: Observable<PingMessage>) => messages$
	.subscribe(message => message.client.send(JSON.stringify({ message: 'pong'})))

const initUnknown = (messages$: Observable<ClientMessage>) => messages$
	.subscribe(message => message.client.send(JSON.stringify({ error: 'unknown message'
	                                                         , message: message.message
	                                                         })))

export const initApi = (messages$: Observable<ClientMessage>) => {
	initPing(messages$.pipe(filter(matchMessage('ping'))))
	initUnknown(messages$.pipe(filter(matchUnknown)))
}
