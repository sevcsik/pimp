import { Event } from '@pimp/framework/cjs/server'

import { Repository, RepositoryId } from './objects'

export interface RepositoryCreated extends Event { name: 'repository created', repository: Repository }
export interface RepositoryUpdated extends Event { name: 'repository updated', repository: Repository }
export interface RepositoryRemoved extends Event { name: 'repository removed', id: RepositoryId }

export type AnyEvent = RepositoryCreated
                     | RepositoryUpdated
                     | RepositoryRemoved
