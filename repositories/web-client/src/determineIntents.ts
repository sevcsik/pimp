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
    const saveClicks$ = dom.select('pimp-repository-edit').events('click')
        .pipe(filter(evt => (evt.target as HTMLElement).classList.contains('save-button')))

    const createIntents$ = createClicks$
        .pipe(map((evt: Event) => ({ _type: 'intent', name: 'create' } as CreateRepository)))

    const editIntents$ = editClicks$
        .pipe(map((evt: Event) => ({ _type: 'intent'
                                   , id: (evt.currentTarget as HTMLElement).dataset['id']
                                   , name: 'edit'
                                   } as EditRepository)))

    const saveIntents$ = saveClicks$
        .pipe(map((evt: Event): SaveRepository => {
            const name = ((evt.currentTarget as HTMLElement).querySelector('.name-field') as HTMLInputElement).value
            const provider = ((evt.currentTarget as HTMLElement).querySelector('.provider-field') as HTMLInputElement).value

            return { _type: 'intent'
                   , fields: { name, provider }
                   , id: (evt.currentTarget as HTMLElement).dataset['id'] as string
                   , name: 'save'
                   }
        }))
        .pipe(tap(console.log))

    return merge(createIntents$, editIntents$, saveIntents$)
}
