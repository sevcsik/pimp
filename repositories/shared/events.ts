import { Repository, RepositoryId } from './objects'

export interface Event { _type: 'event', _id: string, name: string }

export interface RepositoryCreated extends Event { name: 'repository created', repository: Repository }
export interface RepositoryUpdated extends Event { name: 'repository updated', repository: Repository }
export interface RepositoryRemoved extends Event { name: 'repository removed', id: RepositoryId }

export type AnyEvent = RepositoryCreated
                     | RepositoryUpdated
                     | RepositoryRemoved
