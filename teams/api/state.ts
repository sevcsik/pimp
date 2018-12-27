import * as Domain from '../domain'
import { WSCommand, WSReply } from './common'

import { Observable } from 'rxjs'
import { map, withLatestFrom, scan } from 'rxjs/operators'

export const initState = ( commands$: Observable<WSCommand & { command: Domain.GetStateCommand }>
                         , events$: Observable<Domain.AllEvents>
                         ): { replies$: Observable<WSReply & { reply: Domain.GetStateReply }>
                            , state$: Observable<Domain.State>
                            } => {

	const state$ = events$.pipe(scan(Domain.apply, Domain.initialState))
	const replies$ = commands$
		.pipe(withLatestFrom(state$))
		.pipe(map(([ command, state ]) => {
			const reply: Domain.GetStateReply = { command: command.command, state }
			return { to: command.from, reply }
		}))

	return { replies$, state$ }
}
