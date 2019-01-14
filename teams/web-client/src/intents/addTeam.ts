import { Intent, isIntent } from './common';

import { DOMSource } from '@cycle/dom/lib/es6/rxjs';
import { merge, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { tag } from 'rxjs-spy/operators';

export interface AddTeamChange extends Intent {
    teamName: string;
    email: string;
    name: 'addTeam.formchange';
}
export interface AddTeamSubmit extends Intent {
    teamName: string;
    email: string;
    name: 'addTeam.submit';
}

export const isAddTeamSubmitIntent = isIntent<AddTeamSubmit>('addTeam.submit');
export const isAddTeamChangeIntent = isIntent<AddTeamChange>('addTeam.change');

export const getIntents$ = (dom: DOMSource): Observable<Intent> => {
    const tp = `intents/addTeam.ts:getIntents$`;
    const changeIntents$: Observable<AddTeamChange> = dom
        .select('.team-edit-form[team-id="new"]')
        .events('keyup')
        .pipe(tag(`${tp}:changeEvents`))
        .pipe(
            map(({ currentTarget }) => {
                const form = currentTarget as HTMLFormElement;

                return {
                    email: form.email.value,
                    name: 'addTeam.formchange',
                    teamName: form.teamName.value,
                    type: 'intent'
                } as AddTeamChange;
            })
        )
        .pipe(tag(`${tp}:addFormChangeIntents`));

    const submitIntents$: Observable<AddTeamSubmit> = dom
        .select('.add-form')
        .events('submit')
        .pipe(tag(`${tp}:submitEvents`))
        .pipe(
            tap(event => {
                event.preventDefault();
            })
        )
        .pipe(
            map(({ currentTarget }) => {
                const form = currentTarget as HTMLFormElement;

                return {
                    email: form.email.value,
                    name: 'addTeam.submit',
                    teamName: form.teamName.value,
                    type: 'intent'
                } as AddTeamSubmit;
            })
        )
        .pipe(tag(`{tp}:addTeam.submitIntents`));

    return merge(changeIntents$, submitIntents$);
};
