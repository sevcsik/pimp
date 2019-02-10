export type RepositoryProvider = 'bitbucket' | 'github'
export type RepositoryId = string

export interface RepositoryFields { name: string
                                  , provider: RepositoryProvider
                                  }

export interface Repository extends RepositoryFields { id: RepositoryId }

