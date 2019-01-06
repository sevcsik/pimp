import * as Domain from '../../domain';
import { view } from './view';
import { makeWebsocketDriver } from './websocketDriver';

import { makeDOMDriver } from '@cycle/dom';
import { run } from '@cycle/rxjs-run';
// @ts-ignore
import { Observable, merge, of } from 'rxjs';
import { filter, map, scan } from 'rxjs/operators';

const drivers = {
    dom: makeDOMDriver('#team-manage'),
    ws: makeWebsocketDriver('ws://localhost:8000')
};

type Sources = { dom: Observable<any>; ws: Observable<any> };

const main = ({ dom: dom$, ws: ws$ }: Sources) => {
    const initialState$: Observable<Domain.State> = ws$
        .pipe(filter(message => message.state))
        .pipe(map(message => message.state));

    const events$: Observable<Domain.AnyEvent> = ws$.pipe(
        filter(message => message.name)
    );
    const state$ = merge(initialState$, events$).pipe(scan(Domain.apply));

    const view$ = view(state$);
    const commands$ = of({
        name: 'get state',
        context: 'team',
        id: 'cafebabe'
    });

    return { dom: view$, ws: commands$ };
};

run(main as any, drivers);
