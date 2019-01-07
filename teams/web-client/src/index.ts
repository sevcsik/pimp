import 'symbol-observable'; // Polyfill required to make Observable.from(Stream) work.

import * as Domain from '../../domain';
import { getIntents$, isAddFormSubmitIntent } from './intents';
import { getState$ } from './model/state';
import { view } from './view';
import { makeWebsocketDriver } from './infra/websocketDriver';

import { makeDOMDriver, DOMSource } from '@cycle/dom/lib/es6/rxjs';
import { iteratee } from 'lodash/fp';
import { run } from '@cycle/rxjs-run';
// @ts-ignore
import { Observable, merge, of } from 'rxjs';
import { filter, map, scan } from 'rxjs/operators';
import { create as createSpy } from 'rxjs-spy';
import { tag } from 'rxjs-spy/operators';
import * as uuid from 'uuid/v1';

const spy = createSpy();
spy.log(/.+/);

const drivers = {
    dom: makeDOMDriver('#team-manage'),
    ws: makeWebsocketDriver('ws://localhost:8000')
};

type Sources = {
    dom: DOMSource;
    ws: Observable<Domain.AnyReply | Domain.AnyEvent>;
};

const main = ({ dom, ws: ws$ }: Sources) => {
    const tp = 'index.ts:main:replies';
    const replies$ = ws$
        .pipe(filter(Domain.matchReplies))
        .pipe(tag(`${tp}:replies`));
    const events$ = ws$
        .pipe(filter(Domain.matchEvents))
        .pipe(tag(`${tp}:events`));
    const { commands$: getStateCommands$, state$ } = getState$(
        events$,
        replies$
    );
    const intents$ = getIntents$(dom).pipe(tag(`${tp}:intents`));
    const view$ = view(state$.pipe(tag(`${tp}:state`)));

    // TODO: move this to model, add validation
    const addNewCommands$ = intents$
        .pipe(filter(isAddFormSubmitIntent))
        .pipe(
            map(({ email, teamName }) => ({
                context: 'team',
                email,
                name: 'create',
                teamName,
                type: 'command'
            }))
        );

    return { dom: view$, ws: merge(addNewCommands$, getStateCommands$) };
};

run(main as any, drivers);
