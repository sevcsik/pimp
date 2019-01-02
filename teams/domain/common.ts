export type AggregateId = String
export type AggregateRoot = { id: AggregateId }
export interface Command { context: Context, id: UUID, name: CommandName }
export type CommandName = String
export type Context = String
export interface Event { context: Context, id: AggregateId, name: EventName }
export type EventName = String
export interface Reply { command: Command }
export type UUID = String

export const areCommandsEqual = (c1: Command, c2: Command): boolean => c1.id === c2.id
