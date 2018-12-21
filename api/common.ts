import * as WebSocket from 'ws'

import { Command, Reply } from '../domain/common'
export type WSCommand = { from: WebSocket, command: Command }
export type WSReply = { to: WebSocket, reply: Reply }
