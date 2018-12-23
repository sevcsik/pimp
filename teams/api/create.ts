import { WSCommand, WSReply } from './common'
import * as Domain from '../domain'

import { Observable } from 'rxjs'
import { partition, map } from 'rxjs/operators'

export const initCreate = (commands$: Observable<WSCommand & { command: Domain.CreateTeamCommand }>):
		{ events$: Observable<Domain.TeamCreatedEvent>
		, replies$: Observable<WSReply & { reply: Domain.InvalidCommandreply }>
		} => {

	const parts = partition(
		({ command: { teamName, email } }) => Domain.validateTeam(teamName, email)
	)(commands$)

	const acceptedCreateCommands$ = parts[0] as Observable<WSCommand & { command: Domain.CreateTeamCommand }>
	const rejectedCreateCommands$ = parts[1] as Observable<WSCommand & { command: Domain.CreateTeamCommand }>

	const events$ = acceptedCreateCommands$.pipe(map(({ command: { teamName, email } }): Domain.TeamCreatedEvent => (
			{ context: 'team'
			, id: email
			, name: 'created'
			, team: { email
			        , id: email
			        , name: teamName
			        }
			}
		)))

	const replies$ = rejectedCreateCommands$
		.pipe(map(command => {
			const reply: Domain.InvalidCommandreply = { command: command.command
			                                          , error: 'invalid command'
			                                          }
			return { to: command.from, reply }
		}))
	
	return { events$, replies$ }

}
