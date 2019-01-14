import * as Domain from '../../../domain';
import * as Intents from '../intents';

import { merge, Observable, of } from 'rxjs';
import { filter, map, scan } from 'rxjs/operators';
import * as uuid from 'uuid/v1';

export interface ClientState extends Domain.State {
    dirtyTeams: ReadonlyArray<Domain.Team>;
}

export const reducer = (
    state: ClientState,
    item: Intents.Intent | Domain.AnyEvent
): ClientState => {
    if (Intents.isEditTeamStartIntent(item)) {
        const team = state.teams.find(team => team.id === item.teamId);

        if (team !== undefined)
            return { ...state, ...{ dirtyTeams: [...state.dirtyTeams, team] } };
        else return state;
    } else if (Domain.matchEvents(item)) {
        // Apply server-side events with the common logic
        return { ...state, ...Domain.apply(state, item) };
    } else {
        console.error('Unknown item in reducer: ', item);
        return state;
    }
};

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
    replies$: Observable<Domain.Reply>,
    intents$: Observable<Intents.Intent>
): {
    state$: Observable<ClientState>;
    commands$: Observable<Domain.GetStateCommand>;
} => {
    const { state$: serverState$, commands$ } = getInitialState$(replies$);
    const initialState$ = serverState$.pipe(
        map(serverState => ({ ...serverState, dirtyTeams: [] } as ClientState))
    );
    return {
        state$: merge(initialState$, events$, intents$).pipe(scan(reducer)),
        commands$
    };
};
