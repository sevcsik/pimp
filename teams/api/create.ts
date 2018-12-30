import { WSCommand, WSReply } from './common'
import * as Domain from '../domain'

import { Observable, merge, of } from 'rxjs'
import { partition, map, withLatestFrom, pluck } from 'rxjs/operators'
import { tag } from 'rxjs-spy/operators/tag'

export const initCreate = ( commands$: Observable<WSCommand & { command: Domain.CreateTeamCommand }>
                          , state$: Observable<Domain.State>
                          ):
	{ events$: Observable<Domain.TeamCreatedEvent>
	, replies$: Observable<WSReply & { reply: Domain.InvalidCommandreply }>
	} => {

	type CommandWithState = [ WSCommand & { command: Domain.CreateTeamCommand }
		                    , Domain.State
		                    ]
	const tp = 'api/create.ts:initCreate'

	const parts = partition(
		([ { command: { teamName, email } }, { teams } ]: CommandWithState ): boolean =>
			Domain.validate(teamName, email, teams)
	)(commands$.pipe(withLatestFrom(merge(of(Domain.initialState), state$))))

	const acceptedCreateCommands$ = parts[0].pipe(pluck('0')).pipe(tag(`${tp}:acceptedCreateCommands`)) as
		Observable<WSCommand & { command: Domain.CreateTeamCommand }>
	const rejectedCreateCommands$ = parts[1].pipe(pluck('0')).pipe(tag(`${tp}:rejectedCreateCommands`)) as
		Observable<WSCommand & { command: Domain.CreateTeamCommand }>

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
