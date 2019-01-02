import { WSCommand, WSReply } from './common'
import * as Domain from '../domain'

import { Observable, merge } from 'rxjs'
import { partition, map, withLatestFrom, pluck, share } from 'rxjs/operators'
import { tag } from 'rxjs-spy/operators/tag'

export const initUpdate = ( commands$: Observable<WSCommand & { command: Domain.UpdateTeamCommand }>
                          , state$: Observable<Domain.State>
                          ):
	{ events$: Observable<Domain.TeamUpdatedEvent>
	, replies$: Observable<WSReply & { reply: Domain.AcceptedCommandReply | Domain.InvalidCommandReply }>
	} => {

	type CommandWithState = [ WSCommand & { command: Domain.UpdateTeamCommand }
		                    , Domain.State
		                    ]
	const tp = 'api/update.ts:initUpdate'

	const parts = partition(
		([ { command }, state ]: CommandWithState ): boolean => Domain.validateCommand(command, state)
	)(commands$.pipe(withLatestFrom(state$)))

	const acceptedUpdateCommands$ = parts[0].pipe(pluck('0')).pipe(tag(`${tp}:acceptedUpdateCommands`)).pipe(share()) as
		Observable<WSCommand & { command: Domain.UpdateTeamCommand }>
	const rejectedUpdateCommands$ = parts[1].pipe(pluck('0')).pipe(tag(`${tp}:rejectedUpdateCommands`)) as
		Observable<WSCommand & { command: Domain.UpdateTeamCommand }>

	const events$ = acceptedUpdateCommands$.pipe(map(({ command: { teamId, teamName, email } }): Domain.TeamUpdatedEvent => (
			{ context: 'team'
			, id: teamId
			, name: 'updated'
			, team: { email
			        , id: teamId
			        , name: teamName
			        }
			}
		))).pipe(tag(`${tp}:events`))

	const replies$ = merge(
		acceptedUpdateCommands$.pipe(map(command => {
			const reply: Domain.AcceptedCommandReply = { accepted: true, command: command.command }
			return { to: command.from, reply }
		})).pipe(tag(`${tp}:acceptedUpdateReplies`)),
		rejectedUpdateCommands$.pipe(map(command => {
			const reply: Domain.InvalidCommandReply = { command: command.command, error: 'invalid command' }
			return { to: command.from, reply }
		})).pipe(tag(`${tp}:rejectedUpdateReplies`))
	).pipe(tag(`${tp}:replies`))
	
	return { events$, replies$ }
}
