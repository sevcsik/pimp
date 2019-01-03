import { WSCommand, WSReply } from './common'
import * as Domain from '../domain'

import { Observable, merge } from 'rxjs'
import { map } from 'rxjs/operators'
import { tag } from 'rxjs-spy/operators/tag'

export const initUpdate = ( acceptedUpdateCommands$: Observable<WSCommand & { command: Domain.UpdateTeamCommand }>
                          , state$: Observable<Domain.State>
                          ): Observable<Domain.TeamUpdatedEvent> =>

	acceptedUpdateCommands$.pipe(map(({ command: { teamId, teamName, email } }): Domain.TeamUpdatedEvent => (
		{ context: 'team'
		, id: teamId
		, name: 'updated'
		, team: { email
		        , id: teamId
		        , name: teamName
		        }
		}
	)))
