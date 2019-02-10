import { RepositoryFields, RepositoryId } from './objects'

export interface Command { _type: 'command', _id: string, name: string }

export namespace Commands {
    export interface CreateRepository extends Command { name: 'create repository', fields: RepositoryFields }
    export interface UpdateRepository extends Command { name: 'update repository'
                                                      , fields: RepositoryFields
                                                      , id: RepositoryId
                                                      }
    export interface RemoveRepository extends Command { name: 'remove repository', id: RepositoryId }
}

export type AnyCommand = Commands.CreateRepository
                       | Commands.UpdateRepository
                       | Commands.RemoveRepository

