import { initCreate } from './create'
import { initState } from './state'
import { WSCommand, WSReply } from './common'
import * as Domain from '../domain'

import { Observable, Subject, merge } from 'rxjs'
import { filter, map, partition, scan } from 'rxjs/operators'
import { tag } from 'rxjs-spy/operators/tag'
import { iteratee } from 'lodash/fp'

export const initApi = (commands$: Observable<WSCommand>):
		{ events$: Observable<Domain.AllEvents>
		, replies$: Observable<WSReply>
		} => {

	const tp = 'api/index.ts:initApi'
	let parts
	const events$: Subject<Domain.AllEvents> = new Subject
	const replies$: Subject<WSReply> = new Subject

	// Filter messages which concern the Teams bounded context
	parts = partition(matchContext('team'))(commands$)
	const unknownContextReplies$ = initUnknown(parts[1].pipe(tag(`${tp}:unknownContextCommands`)))
	unknownContextReplies$.pipe(tag(`${tp}:unknownContextReplies`)).subscribe(replies$)

	// Handle get state commands
	parts = partition(matchCommand('get state'))(parts[0])
	const getStateCommands$ = parts[0].pipe(tag(`${tp}:getStateCommands`)) as
		Observable<WSCommand & { command: Domain.GetStateCommand }>
	const { state$, replies$: getStateReplies$ } = initState(getStateCommands$, events$)
	getStateReplies$.pipe(tag(`${tp}:getStateReplies`)).subscribe(replies$)

	// Handle create commands
	parts = partition(matchCommand('create'))(parts[1])
	const createCommands$ = parts[0].pipe(tag(`${tp}:createCommands`)) as
		Observable<WSCommand & { command: Domain.CreateTeamCommand }>
	const { events$: createEvents$, replies$: createReplies$ } = initCreate(createCommands$, state$)
	createEvents$.pipe(tag(`${tp}:createEvents`)).subscribe(events$)
	createReplies$.pipe(tag(`${tp}:createReplies`)).subscribe(replies$)

	// Handle leftover commands as unknown
	const unknownCommands$ = parts[1] as Observable<WSCommand>
	const unknownCommandReplies$ = initUnknown(unknownCommands$)
	unknownCommandReplies$.subscribe(replies$)

	return { events$: events$.asObservable(), replies$: replies$.asObservable() }
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
