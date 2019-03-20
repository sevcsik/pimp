import { AnyIntent
       , CreateRepository
       , EditRepository
       , SaveRepository
       } from '../../shared/intents'

import { DOMSource } from '@cycle/dom/lib/es6/rxjs'
import { merge, Observable } from 'rxjs'
import { filter, map, tap } from 'rxjs/operators'

export const determineIntents = (dom: DOMSource): Observable<AnyIntent> => {
    const createClicks$ = dom.select('.create-button').events('click')
    const editClicks$ = dom.select('pimp-repository .edit-button').events('click')
    const saveClicks$ = dom.select('pimp-repository-edit .save-button').events('click')

    const createIntents$ = createClicks$
        .pipe(map((evt: Event) => ({ _type: 'intent', name: 'create' } as CreateRepository)))

    const editIntents$ = editClicks$
        .pipe(map((evt: Event) => ({ _type: 'intent'
                                   , name: 'edit'
                                   , id: (evt.currentTarget as HTMLElement).dataset['id']
                                   } as EditRepository)))

    const saveIntents$ = saveClicks$
        .pipe(map((evt: Event) => ({ _type: 'intent'
                                   , name: 'save'
                                   , id: (evt.currentTarget as HTMLElement).dataset['id']
                                   } as SaveRepository)))
                                   .pipe(tap(console.log))

    return merge(createIntents$, editIntents$, saveIntents$)
}
