import 'symbol-observable'; // Polyfill required to make Observable.from(Stream) work.
import {
    DOMSource,
    mkMain,
    mkWebsocketClientDriver
} from '@pimp/framework/client';
import { makeDOMDriver } from '@cycle/dom';
import { run } from '@cycle/rxjs-run';

import { AnyCommand } from '../../shared/commands';
import { AnyEvent } from '../../shared/events';
import { AnyIntent } from '../../shared/intents';
import { AnyReply } from '../../shared/replies';
import { determineIntents } from './determineIntents';
import { executeIntents } from './executeIntents';
import { mkState, State } from './state';
import { State as ServerState } from '../../shared/state';
import { reducer } from './state';
import { renderState } from './view';
import {
    validateCommand,
    ValidationFailureReason
} from '../../shared/validateCommand';

import { create as createSpy } from 'rxjs-spy';

const drivers = {
    ws: mkWebsocketClientDriver('http://localhost:8000'),
    dom: makeDOMDriver('#repositories-manage')
};

const spy = createSpy();
spy.log(/.+/);

const main = mkMain<
    AnyCommand,
    AnyEvent,
    AnyReply,
    AnyIntent,
    ValidationFailureReason,
    ServerState,
    State
>(
    determineIntents,
    executeIntents,
    validateCommand,
    reducer,
    mkState,
    renderState
);

run(main as any, drivers);
