import { Command } from '../domain/common'
export type WSMessage = { client: WebSocket }
export type WSCommand = WSMessage & { command: Command }
