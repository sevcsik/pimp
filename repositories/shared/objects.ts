export type RepositoryId = string

export interface RepositoryFields { name: string
                                  , provider: string
                                  }

export interface Repository extends RepositoryFields { id: RepositoryId }

