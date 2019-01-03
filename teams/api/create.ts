import { WSCommand, WSReply } from './common'
import * as Domain from '../domain'

import { Observable, merge } from 'rxjs'
import { map } from 'rxjs/operators'
import { tag } from 'rxjs-spy/operators/tag'
import * as uuid from 'uuid'

export const initCreate = ( acceptedCreateCommands$: Observable<WSCommand & { command: Domain.CreateTeamCommand }>
                          , state$: Observable<Domain.State>
                          ): Observable<Domain.TeamCreatedEvent> =>

	acceptedCreateCommands$
		.pipe(map(({ command: { teamName, email } }): Domain.TeamCreatedEvent => {
			const id = uuid.v1()
			return { context: 'team'
			       , id
			       , name: 'created'
			       , team: { email
			               , id
			               , name: teamName
			               }
			       }
	}))
