import { Intent } from './common';
import * as AddTeam from './addTeam';
import * as EditTeam from './editTeam';

import { DOMSource } from '@cycle/dom/lib/es6/rxjs';
import { merge, Observable } from 'rxjs';
import { tag } from 'rxjs-spy/operators';

export { Intent, isIntent } from './common';
export { isAddTeamChangeIntent, isAddTeamSubmitIntent } from './addTeam';
export { isEditTeamStartIntent } from './editTeam';

export const getIntents$ = (dom: DOMSource): Observable<Intent> =>
    merge(AddTeam.getIntents$(dom), EditTeam.getIntents$(dom)).pipe(
        tag('intents/index.ts:getIntents')
    );
