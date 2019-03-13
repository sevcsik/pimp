import { EditRepository } from './intents'

import { Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

export const determineIntents = (dom: DOMSource): Observable<AnyIntent> => {
    const repositoryClicks$ = dom.select('pimp-repository').events('click')
    const editClicks$ = repositoryClicks$
        .pipe(filter((evt: Event) => evt.target.hasClass('edit-button')))

    const editIntents$ = editClicks$
        .pipe(map((evt: Event) => (
            { _type: 'intent'
            , name: 'edit'
            , id: evt.currentTarget
            } as EditRepository )))

    return editIntents$
}

