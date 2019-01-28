// Domain objects

export type RepositoryProvider = 'bitbucket' | 'github'
export type RepositoryId = string

export interface RepositoryFields { repoName: string
                                  , provider: RepositoryProvider
                                  }

export interface Repository extends RepositoryFields { _type: 'repository', _id: RepositoryId }

// Commands

export interface Command { _type: 'command', _id: string, name: string }

namespace Commands {
    export interface CreateRepository extends Command, RepositoryFields { name: 'create repository' }
    export interface UpdateRepository extends Command, RepositoryFields { name: 'update repository', id: RepositoryId }
    export interface RemoveRepository extends Command { name: 'remove repository', id: RepositoryId }
}

export type AnyCommand = Commands.CreateRepository
                       | Commands.UpdateRepository
                       | Commands.RemoveRepository

export interface Event { _type: 'event', _id: string, name: string }

namespace Events {
    export interface RepositoryCreated extends Event { name: 'repository created', repository: Repository }
    export interface RepositoryUpdated extends Event { name: 'repository updated', repository: Repository }
    export interface RepositoryRemoved extends Event { name: 'repository removed', id: RepositoryId }
}

export type AnyEvent = Events.RepositoryCreated
                     | Events.RepositoryUpdated
                     | Events.RepositoryRemoved

export interface Reply { _type: 'reply', command: Command }

namespace Replies {
    export interface CommandAccepted extends Reply { name: 'command accepted' }
    export interface CommandRejected extends Reply { name: 'command rejected', reason: string }
    export interface CommandInvalid extends CommandRejected { reason: 'invalid fields'
                                                            , validationErrors: ReadonlyArray<ValidationError>
                                                            }
}

export type AnyReply = Replies.CommandAccepted
                     | Replies.CommandInvalid
                     | Replies.CommandRejected

export interface ValidationError { field: string, reason: string }

