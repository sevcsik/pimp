import { initCreate } from './create'
import { initState } from './state'
import { WSCommand, WSReply } from './common'
import * as Domain from '../domain'

import { Observable, Subject, merge } from 'rxjs'
import { filter, map, partition, scan, tap } from 'rxjs/operators'
import { tag } from 'rxjs-spy/operators/tag'
import { iteratee } from 'lodash/fp'

const matchCommand = (name: string) => iteratee({ command: { context: 'team', name } })

const initUnknown = (commands$: Observable<WSCommand>): Observable<WSReply & { reply: Domain.UnknownCommandreply }> =>
	commands$.pipe(map(command => {
		const reply: Domain.UnknownCommandreply = { command: command.command
	                                              , error: 'unknown command'
	                                              }
		return { to: command.from, reply }
	}))

export const initApi = (commands$: Observable<WSCommand>):
		{ events$: Observable<Domain.AllEvents>
		, replies$: Observable<WSReply>
		} => {

	const tp = 'api/index.ts:initApi'
	let parts
	const events$: Subject<Domain.AllEvents> = new Subject

	// Handle get state commands
	parts = partition(matchCommand('get state'))(commands$)
	const getStateCommands$ = parts[0].pipe(tag(`${tp}:getStateCommands`)) as
		Observable<WSCommand & { command: Domain.GetStateCommand }>
	const { state$, replies$: getStateReplies$ } = initState(getStateCommands$, events$)

	// Handle create commands
	parts = partition(matchCommand('create'))(parts[1])
	const createCommands$ = parts[0].pipe(tag(`${tp}:createCommands`)) as
		Observable<WSCommand & { command: Domain.CreateTeamCommand }>
	const { events$: createEvents$, replies$: createReplies$ } = initCreate(createCommands$, state$)

	// Handle update commands
	parts = partition(matchCommand('update'))(parts[1])
	const updateCommands$ = parts[0].pipe(tag(`${tp}:updateCommands`)) as
		Observable<WSCommand & { command: Domain.CreateTeamCommand }>
	const { events$: updateEvents$, replies$: updateReplies$ } = initCreate(updateCommands$, state$)

	// Handle leftover commands as unknown
	const unknownCommands$ = parts[1] as Observable<WSCommand>
	const unknownCommandReplies$ = initUnknown(unknownCommands$)

	const replies$ = merge( unknownCommandReplies$.pipe(tag(`${tp}:unknownCommandReplies`))
	                      , getStateReplies$.pipe(tag(`${tp}:getStateReplies`))
	                      , createReplies$.pipe(tag(`${tp}:createReplies`))
	                      , updateReplies$.pipe(tag(`${tp}:updateReplies`))
	                      )

	createEvents$.subscribe(events$)

	return { events$: events$.asObservable(), replies$ }
}
