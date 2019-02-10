import { AnyCommand } from './commands'
import { AnyEvent } from './events'

import * as uuid from 'uuid'

declare function assertNever (n: never): never

export const executeCommand = (command: AnyCommand): AnyEvent => {
    const eventId = uuid.v1()
    switch (command.name) {
        case 'create repository':
            return { _type: 'event'
                   , _id: eventId
                   , name: 'repository created'
                   , repository: { id: uuid.v1()
                                 , name: command.fields.name
                                 , provider: command.fields.provider
                                 }
                   }

        case 'update repository':
            return { _type: 'event'
                   , _id: eventId
                   , name: 'repository updated'
                   , repository: { id: command.id
                                 , name: command.fields.name
                                 , provider: command.fields.provider
                                 }
                   }

        case 'remove repository':
            return { _type: 'event'
                   , _id: 'eventId'
                   , name: 'repository removed'
                   , id: command.id
                   }

        default: return assertNever(command)
    }
}

