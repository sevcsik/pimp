// @ts-ignore
import * as uuid from 'uuid/v1'

export interface Command { _type: 'command', _id: string, name: string }
export interface GetState extends Command { name: 'get state' }
export type AnyBuiltinCommand = GetState

export function mkBuiltinCommand<AnyCommand>(name: 'get state'): AnyBuiltinCommand {
    const baseCommand = { _type: 'command', _id: uuid() }
    const assertNever = (commandName: never) => { throw new Error(`Unknown command: ${commandName}`) }

    switch(name) {
        case 'get state':
            return { ...baseCommand, name: 'get state' } as GetState
        default:
            return assertNever(name)
    }
}
