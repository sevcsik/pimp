import { initCreate } from './create'
import { WSCommand, WSReply } from './common'
import * as Domain from '../domain'

import { Observable, ReplaySubject, merge } from 'rxjs'
import { filter, map, partition } from 'rxjs/operators'
import { iteratee } from 'lodash/fp'

type TeamEvents = Domain.TeamCreatedEvent
                | Domain.TeamDeletedEvent
                | Domain.TeamUpdatedEvent

export const initApi = (commands$: Observable<WSCommand>) => {
	const parts = partition(matchContext('team'))(commands$)
	const teamCommands$ = parts[0] as Observable<WSCommand & { command: Domain.TeamCommand }>
	const rest$ = parts[1] as Observable<WSCommand>
	const { events$: teamEvents$, replies$: teamReplies$ } = initContext(teamCommands$)

	const unknownMessageErrors$ = initUnknown(rest$)

	const replies$ = merge(teamReplies$, unknownMessageErrors$)
	return { events$: teamEvents$, replies$ }
}

const initContext = (commands$: Observable<WSCommand>):
		{ events$: Observable<TeamEvents>, replies$: Observable<WSReply> } => {
	const parts = partition(matchCommand('create'))(commands$)
	const createCommands$ = parts[0] as Observable<WSCommand & { command: Domain.CreateTeamCommand }>
	const { events$: createEvents$, replies$: createReplies$ } = initCreate(createCommands$)

	const unknownCommands$ = parts[1] as Observable<WSCommand>
	const unknownCommandReplies$ = unknownCommands$.pipe(map(command => {
		const reply: Domain.UnknownCommandreply = { command: command.command
		                                          , error: 'unknown command'
		                                          }
		return { to: command.from, reply }
	}))


	return { events$: createEvents$, replies$: merge(unknownCommandReplies$, createReplies$) }
}

const initUnknown = (commands$: Observable<WSCommand>): Observable<WSReply & { reply: Domain.UnknownCommandreply }> =>
	commands$.pipe(map(command => {
		const reply: Domain.UnknownCommandreply = { command: command.command
	                                              , error: 'unknown command'
	                                              }
		return { to: command.from, reply }
	}))

const matchContext = (context: string) => iteratee({ command: { context } })
const matchCommand = (name: string) => iteratee({ command: { name } })
