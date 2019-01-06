import { WSCommand, WSReply } from './common'
import * as Domain from '../domain'

import { Observable, merge } from 'rxjs'
import { partition, map, withLatestFrom, pluck, share } from 'rxjs/operators'
import { tag } from 'rxjs-spy/operators/tag'
import * as uuid from 'uuid'

export const initCreate = ( commands$: Observable<WSCommand & { command: Domain.CreateTeamCommand }>
                          , state$: Observable<Domain.State>
                          ):
	{ events$: Observable<Domain.TeamCreatedEvent>
	, replies$: Observable<WSReply & { reply: Domain.AnyReply }>
	} => {

	type CommandWithState = [ WSCommand & { command: Domain.CreateTeamCommand }
		                    , Domain.State
		                    ]
	const tp = 'api/create.ts:initCreate'

	const parts = partition(
		([ { command }, state ]: CommandWithState ): boolean => Domain.validateCommand(command, state)
	)(commands$.pipe(withLatestFrom(state$)))

	const acceptedCreateCommands$ = parts[0].pipe(pluck('0')).pipe(tag(`${tp}:acceptedCreateCommands`)).pipe(share()) as
		Observable<WSCommand & { command: Domain.CreateTeamCommand }>
	const rejectedCreateCommands$ = parts[1].pipe(pluck('0')).pipe(tag(`${tp}:rejectedCreateCommands`)) as
		Observable<WSCommand & { command: Domain.CreateTeamCommand }>

	const events$ = acceptedCreateCommands$
		.pipe(map(({ command: { teamName, email } }): Domain.TeamCreatedEvent => {
			const id = uuid.v1()
			return { context: 'team'
			       , id
			       , name: 'created'
			       , team: { email
			               , id
			               , name: teamName
			               }
			       }
	})).pipe(tag(`${tp}:events`))

	const replies$ = merge(
		acceptedCreateCommands$.pipe(map(command => {
			const reply: Domain.AcceptedCommandReply = { accepted: true, command: command.command }
			return { to: command.from, reply }
		})).pipe(tag(`${tp}:acceptedCreateReplies`)),
		rejectedCreateCommands$.pipe(map(command => {
			const reply: Domain.InvalidCommandReply = { command: command.command, error: 'invalid command' }
			return { to: command.from, reply }
		})).pipe(tag(`${tp}:rejectedCreateReplies`))
	).pipe(tag(`${tp}:replies`))

	return { events$, replies$ }
}
