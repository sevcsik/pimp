export type AggregateId = String
export type AggregateRoot = { id: AggregateId }
export type CommandName = String
export type Command = { context: Context, name: CommandName }
export type Context = String
export type EventName = String
export type Event = { context: Context, id: AggregateId, name: EventName }
export type Reply = { command: Command }
