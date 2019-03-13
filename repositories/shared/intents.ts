import { Intent } from '@pimp/framework/intents'

import { Repository, RepositoryFields, RepositoryId } from '../shared/objects'

export interface CreateRepository extends Intent { _type: 'intent', name: 'edit', fields: RepositoryFields }
export interface EditRepository   extends Intent { _type: 'intent', name: 'edit', id: RepositoryId }
export interface RemoveRepository extends Intent { _type: 'intent', name: 'delete', repositoryId: RepositoryId }
export interface SaveRepository   extends Intent { _type: 'intent'
                                                 , name: 'edit'
                                                 , fields: RepositoryFields
                                                 , id: RepositoryId
                                                 }

export type AnyIntent = CreateRepository
                      | EditRepository
                      | RemoveRepository
                      | SaveRepository
