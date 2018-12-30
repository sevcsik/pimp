import * as Domain from '../domain'
import { WSCommand, WSReply } from './common'

import { Observable, of, merge } from 'rxjs'
import { map, withLatestFrom, scan, tap } from 'rxjs/operators'
import { tag } from 'rxjs-spy/operators'

export const initState = ( commands$: Observable<WSCommand & { command: Domain.GetStateCommand }>
                         , events$: Observable<Domain.AllEvents>
                         ): { replies$: Observable<WSReply & { reply: Domain.GetStateReply }>
                            , state$: Observable<Domain.State>
                            } => {

	const tp = 'api/state.ts:initState'
	const state$ = events$.pipe(scan(Domain.apply, Domain.initialState)).pipe(tag(`${tp}:state`))
	const replies$ = commands$
		.pipe(withLatestFrom(merge(of(Domain.initialState), state$)))
		.pipe(map(([ command, state ]) => {
			const reply: Domain.GetStateReply = { command: command.command, state }
			return { to: command.from, reply }
		}))

	return { replies$, state$ }
}
