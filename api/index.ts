import { WSCommand, WSReply } from './common'
import * as Domain from '../domain/team'

import { Observable, ReplaySubject } from 'rxjs'
import { filter, map, partition } from 'rxjs/operators'
import { iteratee } from 'lodash/fp'

type TeamEvents = Domain.TeamCreatedEvent
                | Domain.TeamDeletedEvent
                | Domain.TeamUpdatedEvent

export const initApi = (commands$: Observable<WSCommand>) => {
	const parts = partition(matchContext('team'))(commands$)
	const teamCommands$ = parts[0] as Observable<WSCommand & { command: Domain.TeamCommand }>
	const rest$ = parts[1] as Observable<WSCommand>

	const events$ = initEvents(teamCommands$)
	const unknownMessageErrors$ = initUnknown(rest$)

	return { events$, unknownMessageErrors$ }
}

const initEvents = (commands$: Observable<WSCommand>):
		{ events$: Observable<TeamEvents>, replies$: Observable<WSReply> } => {
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

	const invalidCreateCommandReplies$ = rejectedCreateCommands$
		.pipe(map(command => {
			const reply: Domain.InvalidCommandreply = { command: command.command
			                                          , error: 'invalid command'
			                                          }
			return { to: command.from, reply }
		}))

	return { events$: events$.asObservable(), replies$: invalidCreateCommandReplies$ }
}

const initUnknown = (commands$: Observable<WSCommand>): Observable<WSReply & { reply: Domain.UnknownCommandreply }> =>
	commands$.pipe(map(command => {
		const reply: Domain.UnknownCommandreply = { command: command.command
	                                              , error: 'unknown command'
	                                              }
		return { to: command.from, reply }
	}))

const matchContext = (context: string) => iteratee({ command: { context } })
