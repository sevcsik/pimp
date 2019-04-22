import { Repository } from '../../shared/objects'
import { State, UnsavedRepository } from './state'

import { find, filter, flow, map } from 'lodash/fp'
import { VNode } from '@cycle/dom'

const renderUnsavedRepository = ({ id, fields: { name, provider }, fieldValidationErrors }: UnsavedRepository) => {
    const addErrors = (field: string) => (vnode: VNode, { elm }: VNode) => {
        const error = find({ field }, fieldValidationErrors)
        const input = (elm as HTMLInputElement)
        if (error) input.setCustomValidity(error.reason)
    }

    const vnode = (
        <pimp-repository-edit>
            <form action="javascript:0">
                <input className="name-field" placeholder="Repository name" hook-postpatch={ addErrors('repoName') }
                       value={ name } />
                <input className="provider-field" value={ provider } hook-postpatch={ addErrors('provider') } />
                <button className="save-button" data-id={ id }>save</button>
                <button className="discard-button" data-id={ id }>discard</button>
            </form>
        </pimp-repository-edit>
    )

    return vnode
}

const renderRepository = ({ id, name, provider }: Repository) =>
    <pimp-repository>
        <span className="name-field">{ name }</span>
        <span className="provider-field">{ provider }</span>
        <button className="edit-button" data-id={ id }>edit</button>
        <button className="delete-button" data-id={ id }>delete</button>
    </pimp-repository>

const renderExistingRepository = (repository: Repository, state: State) => {
    const unsaved = findUnsaved(repository, state)
    return unsaved ? renderUnsavedRepository(unsaved) : renderRepository(repository)
}

const findUnsaved = (repo: Repository, state: State) => find({ id: repo.id }, state.unsavedRepositories)

export const renderState = (state: State) =>
    <div>
        <h1>Repositories</h1>
        <ul>
            { map(repo => (<li>{ renderExistingRepository(repo, state) }</li>)
                 , state.repositories
                 )
            }
            { flow( filter<UnsavedRepository>(unsavedRepo => unsavedRepo.id === 'new')
                  , map(unsavedRepo => <li>{ renderUnsavedRepository(unsavedRepo) }</li>)
                  )(state.unsavedRepositories)
            }
        </ul>
        <button className="create-button">create</button>
    </div>
