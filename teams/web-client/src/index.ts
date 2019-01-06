import * as Domain from '../../domain';
import { getState$ } from './model/state';
import { view } from './view';
import { makeWebsocketDriver } from './infra/websocketDriver';

import { makeDOMDriver } from '@cycle/dom';
import { iteratee } from 'lodash/fp';
import { run } from '@cycle/rxjs-run';
// @ts-ignore
import { Observable, merge, of } from 'rxjs';
import { filter, map, scan } from 'rxjs/operators';
import * as uuid from 'uuid/v1';

const drivers = {
    dom: makeDOMDriver('#team-manage'),
    ws: makeWebsocketDriver('ws://localhost:8000')
};

type Sources = {
    dom: Observable<any>;
    ws: Observable<Domain.AnyReply | Domain.AnyEvent>;
};

const main = ({ dom: dom$, ws: ws$ }: Sources) => {
    const replies$ = ws$.pipe(filter(Domain.matchReplies));
    const events$ = ws$.pipe(filter(Domain.matchEvents));
    const { commands$: getStateCommands$, state$ } = getState$(
        events$,
        replies$
    );
    const view$ = view(state$);

    return { dom: view$, ws: getStateCommands$ };
};

run(main as any, drivers);
