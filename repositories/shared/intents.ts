import { Intent } from '@pimp/framework/cjs/server'

import { Repository, RepositoryFields, RepositoryId } from '../shared/objects'

export interface CreateRepository extends Intent { _type: 'intent', name: 'create', fields: RepositoryFields }
export interface EditRepository   extends Intent { _type: 'intent', name: 'edit', id: RepositoryId }
export interface RemoveRepository extends Intent { _type: 'intent', name: 'remove', repositoryId: RepositoryId }
export interface SaveRepository   extends Intent { _type: 'intent'
                                                 , name: 'save'
                                                 , fields: RepositoryFields
                                                 , id: RepositoryId
                                                 }

export type AnyIntent = CreateRepository
                      | EditRepository
                      | RemoveRepository
                      | SaveRepository
