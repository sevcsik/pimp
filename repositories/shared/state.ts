import { AnyEvent } from './events'
import { Command } from './commands'
import { Repository } from './objects'

import { filter, iteratee, negate, concat, takeWhile, takeRightWhile } from 'lodash/fp'

export interface State { repositories: ReadonlyArray<Repository> }

export const initialState = { repositories: [] }

declare function assertNever(n: never): never

export const reducer = (state: State, event: AnyEvent): State => {
    switch (event.name) {
        case 'repository created':
            return { ...state, repositories: [ ...state.repositories, event.repository ] }
        case 'repository updated':
            return (
                { ...state, repositories: [ ...takeWhile({ id: event.repository.id }, state.repositories)
                                          , event.repository
                                          , ...takeRightWhile({ id: event.repository.id }, state.repositories)
                                          ]
                })
        case 'repository removed':
            return { ...state, repositories: filter(negate(iteratee({ id: event.id })), state.repositories) }
        default: return assertNever(event)
    }
}

