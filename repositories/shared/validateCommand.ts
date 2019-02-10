import * as D from './domain'

import { cond, contains, defaults, isEmpty, flow, flatMap, includes, lt, negate, size, toPairs, __, T } from 'lodash/fp'

const supportedProviders = [ 'bitbucket', 'github' ]

const validateRepoName = cond(
    [ [ isEmpty              , () => [{ field: 'repoName', reason: 'must not be empty' }]               ]
    , [ negate(contains('/')), () => [{ field: 'repoName', reason: 'must contain a slash' }]            ]
    , [ flow(size, lt(__, 3)), () => [{ field: 'repoName', reason: 'should be at least 3 characters' }] ]
    , [ T                    , () => []                                                                 ]
    ]
)

const validateProvider = cond(
    [ [ isEmpty                                 , () => [{ field: 'provider', reason: 'must not be empty' }] ]
    , [ negate(includes(__, supportedProviders)), () => [{ field: 'provider', reason: 'unknown provider'  }] ]
    , [ T                                       , () => []                                                   ]
    ]
)

const validateRepositoryFields = ({ repoName, provider }: D.RepositoryFields) =>
    [ ...validateRepoName(repoName), ...validateProvider(provider) ]

export const validateCommand = (command: D.AnyCommand): D.AnyReply => {
    if (command.name === 'create repository') {
        const validationErrors = validateRepositoryFields(command)
            return validationErrors.length === 0
                ? { _type: 'reply', command, name: 'command accepted' }
                : { _type: 'reply', command, name: 'command rejected', reason: 'invalid fields', validationErrors }
    } else {
        return { _type: 'reply', command, name: 'command rejected', reason: 'unknown command' }
    }
}
