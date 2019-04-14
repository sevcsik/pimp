import { Command } from '@pimp/framework/cjs/server'

import { RepositoryFields, RepositoryId } from './objects'

export interface CreateRepository extends Command { name: 'create repository', fields: RepositoryFields }
export interface UpdateRepository extends Command { name: 'update repository'
                                                  , fields: RepositoryFields
                                                  , id: RepositoryId
                                                  }
export interface RemoveRepository extends Command { name: 'remove repository', id: RepositoryId }

export type AnyCommand = CreateRepository
                       | UpdateRepository
                       | RemoveRepository

