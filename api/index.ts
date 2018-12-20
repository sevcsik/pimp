import { WSMessage, WSCommand } from './common'

import { Observable } from 'rxjs'
import { filter } from 'rxjs/operators'
import { iteratee, includes, negate } from 'lodash/fp'
import * as WebSocket from 'ws'

export type ConnectionMessage = WSMessage & { message: 'connection' }

const matchContext = (context: string) => iteratee({ command: { context } })

const initUnknown = (commands$: Observable<WSCommand>) => commands$
	.subscribe(message => message.client.send(JSON.stringify({ error: 'unknown command'
	                                                         , command: message.command
	                                                         })))

export const initApi = (commands$: Observable<WSMessage>) => {
	initTeams(commands$.pipe(filter(matchContext('team'))))
	let rest$ = commands$.pipe(filter(negate(matchContext('team'))))
	initUnknown(rest$)
}
