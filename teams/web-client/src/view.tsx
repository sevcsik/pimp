import { State, Team } from '../../domain';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

const renderTeam = ({ id, name, email }: Team) => (
    <li id="team-{id}">
        {name} &lt;{email}&gt;
    </li>
);

export const view = (state$: Observable<State>) =>
    state$.pipe(
        map(state => (
            <div>
                <h1>Teams</h1>
                <ul>{state.teams.map(renderTeam)}</ul>
            </div>
        ))
    );
