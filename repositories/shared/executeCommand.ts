import { AnyCommand, AnyEvent } from './domain'

import * as uuid from 'uuid'

declare function assertNever (n: never): never

export const executeCommand = (command: AnyCommand): AnyEvent => {
    const eventId = uuid.v1()
    switch (command.name) {
        case 'create repository':
            return { _type: 'event'
                   , _id: eventId
                   , name: 'repository created'
                   , repository: { _type: 'repository'
                                 , _id: uuid.v1()
                                 , repoName: command.repoName
                                 , provider: command.provider
                                 }
                   }

        case 'update repository':
            return { _type: 'event'
                   , _id: eventId
                   , name: 'repository updated'
                   , repository: { _type: 'repository'
                                 , _id: command.id
                                 , repoName: command.repoName
                                 , provider: command.provider
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

