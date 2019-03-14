import { AnyIntent, EditRepository } from '../../shared/intents';

import { DOMSource } from '@cycle/dom/lib/es6/rxjs';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export const determineIntents = (dom: DOMSource): Observable<AnyIntent> => {
    const repositoryClicks$ = dom.select('pimp-repository').events('click');
    const editClicks$ = repositoryClicks$.pipe(
        filter(
            (evt: Event) =>
                !!evt.target &&
                (evt.target as Element).classList.contains('edit-button')
        )
    );

    const editIntents$ = editClicks$.pipe(
        map(
            (evt: Event) =>
                ({
                    _type: 'intent',
                    name: 'edit',
                    id: (evt.currentTarget as HTMLElement).dataset['id']
                } as EditRepository)
        )
    );

    return editIntents$;
};
