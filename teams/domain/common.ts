export type AggregateId = String
export type AggregateRoot = { id: AggregateId }
export interface Command { context: Context, id: UUID, name: CommandName, type: 'command' }
export type CommandName = String
export type Context = String
export interface Event { context: Context, id: AggregateId, name: EventName, type: 'event' }
export type EventName = String
export interface Reply { command: Command, type: 'reply' }
export type UUID = String

export const areCommandsEqual = (c1: Command, c2: Command): boolean => c1.id === c2.id

export function matchReplies(message: any): message is Reply { return message.type === 'reply' }
export function matchEvents(message: any): message is Event { return message.type === 'event' }
