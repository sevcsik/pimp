import { AggregateId } from '../../../domain';
import { Intent, isIntent } from './common';

import { DOMSource } from '@cycle/dom/lib/es6/rxjs';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { tag } from 'rxjs-spy/operators';

export interface EditTeamStartIntent extends Intent {
    name: 'editTeam.start';
    teamId: AggregateId;
}

export const isEditTeamStartIntent = isIntent<EditTeamStartIntent>(
    'editTeam.start'
);

export const getIntents$ = (dom: DOMSource): Observable<Intent> => {
    const tp = `intents/editTeam.ts:getIntents`;

    const startIntents$ = dom
        .select('.edit-button')
        .events('click')
        .pipe(tag(`${tp}:editButtonClicks`))
        .pipe(
            map(({ currentTarget }) => {
                const button = currentTarget as HTMLButtonElement;

                return {
                    name: 'editTeam.start',
                    teamId: (button.parentElement as HTMLElement).dataset
                        .teamId,
                    type: 'intent'
                } as EditTeamStartIntent;
            })
        );

    return startIntents$;
};
