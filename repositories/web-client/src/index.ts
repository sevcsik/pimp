import 'symbol-observable' // Polyfill required to make Observable.from(Stream) work.
import { DOMSource, mkMain, mkWebsocketClientDriver } from '@pimp/framework/client'

import { AnyCommand } from '../../shared/commands'
import { AnyEvent } from '../../shared/events'
import { AnyIntent } from '../../shared/intents'
import { determineIntents } from './determineIntents'
import { executeIntents } from './executeIntents'
import { mkState, State } from './state'
import { reducer, State as ServerState } from '../../shared/state'
import { renderState } from './view'
import { validateCommand, ValidationFailureReason } from '../../shared/validateCommand'


const spy = createSpy()
spy.log(/.+/)

const drivers = {
    dom: makeDOMDriver('#repositories-manage'),
    ws: makeWebsocketClientDriver('ws://localhost:8000')
}

const main = mkMain< AnyCommand
                   , AnyEvent
                   , AnyReply
                   , AnyIntent
                   , ValidationFailureReason
                   , ServerState
                   , State
                   >
                   ( determineIntents
                   , executeIntents
                   , validateCommand
                   , reducer
                   , mkState
                   , renderState
                   )


run(main as any, drivers)
