import * as Domain from '../../../domain';

import { merge, Observable, of } from 'rxjs';
import { filter, map, scan } from 'rxjs/operators';
import * as uuid from 'uuid/v1';

export const getInitialState$ = (
    replies$: Observable<Domain.Reply>
): {
    state$: Observable<Domain.State>;
    commands$: Observable<Domain.GetStateCommand>;
} => {
    const id = uuid();
    const getStateCommand = {
        name: 'get state',
        context: 'team',
        id,
        type: 'command'
    } as Domain.GetStateCommand; // TODO: why cast?

    function matchReply(reply: Domain.AnyReply): reply is Domain.GetStateReply {
        return reply.command.id === id;
    }

    const state$ = replies$
        .pipe(filter(matchReply))
        .pipe(map(command => command.state));

    return { state$, commands$: of(getStateCommand) };
};

export const getState$ = (
    events$: Observable<Domain.Event>,
    replies$: Observable<Domain.Reply>
): {
    state$: Observable<Domain.State>;
    commands$: Observable<Domain.GetStateCommand>;
} => {
    const { state$: initialState$, commands$ } = getInitialState$(replies$);

    return {
        state$: merge(initialState$, events$).pipe(scan(Domain.apply)),
        commands$
    };
};
