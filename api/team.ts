import { WSCommand } from './common'
import * as Domain from '../domain/team'

import { Observable, ReplaySubject } from 'rxjs'
import { filter, map, partition } from 'rxjs/operators'

type TeamEvents = Domain.TeamCreatedEvent
                | Domain.TeamDeletedEvent
                | Domain.TeamUpdatedEvent


export const initTeams = (commands$: Observable<WSCommand>): Observable<TeamEvents> => {
	const events$: ReplaySubject<TeamEvents> = new ReplaySubject

	const createCommands$ = commands$.pipe(filter(msg => msg.command.name === 'create'))
	const parts = partition(
		({ command: { teamName, email } }) => Domain.validateTeam(name, email)
	)(createCommands$)

	const acceptedCreateCommands$ = parts[0] as Observable<WSCommand & { command: Domain.CreateTeamCommand }>
	const rejectedCreateCommands$ = parts[1] as Observable<WSCommand & { command: Domain.CreateTeamCommand }>

	(acceptedCreateCommands$ as Observable<WSCommand & { command: Domain.CreateTeamCommand }>)
		.pipe(map(({ command: { teamName, email } }): Domain.TeamCreatedEvent => (
			{ context: 'team'
			, id: email
			, name: 'created'
			, team: { email
			        , id: email
			        , name: teamName
			        }
			}
		)))
		.subscribe(events$)

	rejectedCreateCommands$.subscribe(({ client, command }) => {
		client.send(JSON.stringify({ error: 'invalid command', command }))
	})

	return events$.asObservable()
}
