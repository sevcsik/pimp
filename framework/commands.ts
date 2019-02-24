export interface Command { _type: 'command', _id: string, name: string }
export interface GetState extends Command { name: 'get state' }
export type AnyBuiltinCommand = GetState
