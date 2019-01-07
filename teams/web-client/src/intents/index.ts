import { DOMSource } from '@cycle/dom/lib/es6/rxjs';
import { merge, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { tag } from 'rxjs-spy/operators';

export interface Intent {
    name: string;
    type: 'intent';
}
export interface AddFormChange extends Intent {
    teamName: string;
    email: string;
    name: 'formchange';
}
export interface AddFormSubmit extends Intent {
    teamName: string;
    email: string;
    name: 'submit';
}

export function isIntent(obj: any): obj is Intent {
    return obj.type === 'intent';
}
export function isAddFormSubmitIntent(intent: Intent): intent is AddFormSubmit {
    return intent.name === 'submit';
}

export const getIntents$ = (dom: DOMSource): Observable<Intent> => {
    const tp = `intents/index.ts:getIntents$`;
    const addFormChangeIntents$: Observable<AddFormChange> = dom
        .select('.add-form')
        .events('keyup')
        .pipe(tag(`${tp}:changeEvents`))
        .pipe(
            map(({ currentTarget }) => {
                const form = currentTarget as HTMLFormElement;

                return {
                    email: form.email.value,
                    name: 'formchange',
                    teamName: form.teamName.value,
                    type: 'intent'
                } as AddFormChange;
            })
        )
        .pipe(tag(`${tp}:addFormChangeIntents`));

    const submitIntents$: Observable<AddFormSubmit> = dom
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
                    name: 'submit',
                    teamName: form.teamName.value,
                    type: 'intent'
                } as AddFormSubmit;
            })
        )
        .pipe(tag(`{tp}:submitIntents`));

    return merge(addFormChangeIntents$, submitIntents$);
};
