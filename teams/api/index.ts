import { initCreate } from './create'
import { initState } from './state'
import { WSCommand, WSReply } from './common'
import * as Domain from '../domain'

import { Observable, ReplaySubject, merge } from 'rxjs'
import { filter, map, partition, scan } from 'rxjs/operators'
import { iteratee } from 'lodash/fp'

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
		{ events$: Observable<Domain.AllEvents>
		, replies$: Observable<WSReply>
		, state$: Observable<Domain.State>
		} => {

	let parts = partition(matchCommand('create'))(commands$)
	const createCommands$ = parts[0] as Observable<WSCommand & { command: Domain.CreateTeamCommand }>
	parts = partition(matchCommand('get state'))(parts[1])
	const getStateCommands$ = parts[0] as Observable<WSCommand & { command: Domain.GetStateCommand }>
	const unknownCommands$ = parts[1] as Observable<WSCommand>

	const { events$: createEvents$, replies$: createReplies$ } = initCreate(createCommands$)
	const unknownCommandReplies$ = initUnknown(unknownCommands$)

	const events$ = merge(createEvents$)
	const { state$, replies$: getStateReplies$ } = initState(getStateCommands$, events$)
	const replies$ = merge(createReplies$, getStateReplies$, unknownCommandReplies$) as Observable<WSReply>

	return { events$, replies$, state$ }
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
