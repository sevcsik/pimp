import { WSCommand, WSReply } from './common'
import * as Domain from '../domain'

import { Observable, merge } from 'rxjs'
import { map } from 'rxjs/operators'
import { tag } from 'rxjs-spy/operators/tag'

export const initDelete = ( acceptedDeleteCommands$: Observable<WSCommand & { command: Domain.DeleteTeamCommand }>
                          ): Observable<Domain.TeamDeletedEvent> =>

	acceptedDeleteCommands$.pipe(map(({ command: { teamId } }): Domain.TeamDeletedEvent => (
		{ context: 'team'
		, id: teamId
		, name: 'deleted'
		}
	)))
