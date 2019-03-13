import { State } from './state'

import { VNode } from '@cycle/dom'

const renderRepository = (({ name, provider, repository }): Repository) => (
    <li>
        <pimp-repository data-id={id}>
            <span class="name-field">{name}</span>
            <span class="provider-field">{provider}</span>
            <button class="edit-button">Edit</button>
            <button class="delete-button">Delete</button>
        </pimp-repository>
    </li>
)

export const renderState = (state: State) => (
    <div>
        <h1>Repositories</h1>
        <ul>
            state.repositories.map(renderRepository)
        </ul>
    </div>
)
