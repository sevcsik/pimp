import { State as ServerState } from '../../shared/state'
import { RepositoryId, RepositoryFields } from '../../shared/objects'

interface UnsavedRepository { id: RepositoryId, fields: RepositoryFields }
export interface State extends ServerState { unsavedRepositories: { ReadonlyArray<UnsavedRepository> } }

export const mkState = (state: ServerState | null): State => ({
    repositories: state ? state.repositories : []
    unsavedRepositories: []
})
