// Domain objects

export type RepositoryProvider = 'bitbucket' | 'github'
export type RepositoryId = string

interface RepositoryFields { name: string
                           , provider: RepositoryProvider
                           }

export interface Repository extends RepositoryFields { _type: 'repository', _id: RepositoryId }

// Commands

export interface Command { _type: 'command', _id: string, name: string }

namespace Commands {
    interface CreateRepository extends Command, RepositoryFields { name: 'create repository' }
    interface UpdateRepository extends Command, RepositoryFields { name: 'update repository', id: RepositoryId }
    interface RemoveRepository extends Command { name: 'remove repository', id: RepositoryId }
}

export interface Event { _type: 'event', _id: string, name: string }

namespace Events {
    interface RepositoryCreated extends Event { name: 'repository created', repository: Repository }
    interface RepositoryUpdated extends Event { name: 'repository updated', repository: Repository }
    interface RepositoryRemoved extends Event { name: 'repository removed', id: RepositoryId }
}

export interface Reply { _type: 'reply', command: Command }
