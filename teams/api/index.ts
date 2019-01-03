import { initCreate } from './create'
import { initState } from './state'
import { initUpdate } from './update'
import { WSCommand, WSReply } from './common'
import * as Domain from '../domain'

import { Observable, Subject, merge } from 'rxjs'
import { filter, map, partition, withLatestFrom, pluck, share } from 'rxjs/operators'
import { tag } from 'rxjs-spy/operators/tag'
import { iteratee } from 'lodash/fp'

const matchContext = (context: string) => iteratee({ command: { context } })
const matchCommand = (name: string) => iteratee({ command: {  name } })

const initUnknown = (commands$: Observable<WSCommand>): Observable<WSReply & { reply: Domain.UnknownCommandReply }> =>
	commands$.pipe(map(command => {
		const reply: Domain.UnknownCommandReply = { command: command.command
	                                              , error: 'unknown command'
	                                              }
		return { to: command.from, reply }
	}))

export const initApi = (commands$: Observable<WSCommand>):
		{ events$: Observable<Domain.AnyEvent>
		, replies$: Observable<WSReply>
		} => {

	const tp = 'api/index.ts:initApi'
	let parts
	const events$: Subject<Domain.AnyEvent> = new Subject

	// Filter commands which are for our context
	const relevantCommands$ = commands$.pipe(filter(matchContext('team'))).pipe(tag(`${tp}:relevantCommands`)) as
		Observable<WSCommand & { command: Domain.TeamCommand }>

	// Handle get state commands
	parts = partition(matchCommand('get state'))(relevantCommands$)
	const getStateCommands$ = parts[0].pipe(tag(`${tp}:getStateCommands`)) as
		Observable<WSCommand & { command: Domain.GetStateCommand }>
	const { state$, replies$: getStateReplies$ } = initState(getStateCommands$, events$)

	// Validate commands
	parts = partition(
		([ { command }, state ]): boolean => Domain.validateCommand(command, state)
	)(parts[1].pipe(withLatestFrom(state$)))

	const acceptedCommands$ = parts[0].pipe(pluck('0')).pipe(tag(`${tp}:acceptedCommands`)).pipe(share()) as
		Observable<WSCommand & { command: Domain.AnyCommand }>
	const rejectedCommands$ = parts[1].pipe(pluck('0')).pipe(tag(`${tp}:rejectedCommands`)) as
		Observable<WSCommand & { command: Domain.AnyCommand }>

	const genericReplies$ = merge(
		acceptedCommands$.pipe(map(command => {
			const reply: Domain.AcceptedCommandReply = { accepted: true, command: command.command }
			return { to: command.from, reply }
		})).pipe(tag(`${tp}:acceptedReplies`)),
		rejectedCommands$.pipe(map(command => {
			const reply: Domain.InvalidCommandReply = { command: command.command, error: 'invalid command' }
			return { to: command.from, reply }
		})).pipe(tag(`${tp}:rejectedReplies`))
	).pipe(tag(`${tp}:replies`))

	// Handle create commands
	parts = partition(matchCommand('create'))(acceptedCommands$)
	const createCommands$ = parts[0].pipe(tag(`${tp}:createCommands`)) as
		Observable<WSCommand & { command: Domain.CreateTeamCommand }>
	const createEvents$ = initCreate(createCommands$, state$).pipe(tag(`${tp}:createEvents`))

	// Handle update commands
	parts = partition(matchCommand('update'))(parts[1])
	const updateCommands$ = parts[0].pipe(tag(`${tp}:updateCommands`)) as
		Observable<WSCommand & { command: Domain.UpdateTeamCommand }>
	const updateEvents$ = initUpdate(updateCommands$, state$)

	// Handle leftover commands as unknown
	const unknownCommands$ = parts[1] as Observable<WSCommand>
	const unknownCommandReplies$ = initUnknown(unknownCommands$)

	merge(createEvents$, updateEvents$).subscribe(events$)

	return { events$: events$.asObservable(), replies$: merge(genericReplies$, getStateReplies$) }
}
