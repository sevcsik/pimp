import { AnyCommand } from '../../shared/commands'
import { AnyIntent } from '../../shared/intents'

import * as uuid from 'uuid/v1'

declare function assertNever(n: never): never

export const executeIntents = (intent: AnyIntent): AnyCommand | null => {
    switch (intent.name) {
        case 'create':
        case 'edit':
            return null
        case 'remove':
            throw new Error(`Intent not implemented: ${intent.name}`)
        case 'save':
            return intent.id !== 'new' ? { _type: 'command'
                                         , _id: uuid()
                                         , fields: intent.fields
                                         , id: intent.id
                                         , name: 'update repository'
                                         }
                                       : { _type: 'command'
                                         , _id: uuid()
                                         , fields: intent.fields
                                         , name: 'create repository'
                                         }
        default:
            return assertNever(intent)
    }
}
