import { AnyCommand } from './commands'
import { RepositoryFields } from './objects'
import { AnyReply } from './replies'

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

const validateRepositoryFields = (fields: RepositoryFields) =>
    [ ...validateRepoName(fields.name), ...validateProvider(fields.provider) ]

const defaultFields = { name: ''
                      , provider: ''
                      }

export const validateCommand = (command: AnyCommand): AnyReply => {
    switch (command.name) {
        case 'create repository':
        case 'update repository':
            // Command is coming from the outside - the type checking doesn't protect us.
            // TODO: this should be automated... (swagger?)
            const validationErrors = flow(defaults(defaultFields), validateRepositoryFields)(command.fields)
            return validationErrors.length === 0
                ? { _type: 'reply', command, name: 'command accepted' }
                : { _type: 'reply', command, name: 'command rejected', reason: 'invalid fields', validationErrors }
        case 'remove repository':
            return command.id
                ? { _type: 'reply', command, name: 'command accepted' }
                : { _type: 'reply', command, name: 'command rejected', reason: 'id is missing' }
        default: return { _type: 'reply', command, name: 'command rejected', reason: 'unknown command' }
    }
}
