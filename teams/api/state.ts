import * as Domain from '../domain'
import { WSCommand, WSReply } from './common'

import { Observable } from 'rxjs'
import { map, withLatestFrom, scan, tap, startWith } from 'rxjs/operators'
import { tag } from 'rxjs-spy/operators'

export const initState = ( commands$: Observable<WSCommand & { command: Domain.GetStateCommand }>
                         , events$: Observable<Domain.AnyEvent>
                         ): { replies$: Observable<WSReply & { reply: Domain.GetStateReply }>
                            , state$: Observable<Domain.State>
                            } => {

	const tp = 'api/state.ts:initState'
	const state$ = events$.pipe(scan(Domain.apply, Domain.initialState))
		.pipe(startWith(Domain.initialState))
		.pipe(tag(`${tp}:state`))

	const replies$ = commands$
		.pipe(withLatestFrom(state$))
		.pipe(map(([ command, state ]) => {
			const reply: Domain.GetStateReply = { command: command.command, state }
			return { to: command.from, reply }
		}))

	return { replies$, state$ }
}
