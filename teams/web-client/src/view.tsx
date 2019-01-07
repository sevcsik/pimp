import { State, Team } from '../../domain';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

const idPrefix = `teams-manage`;

const renderTeam = ({ id, name, email }: Team) => (
    <li className="team-{id}">
        {name} &lt;{email}&gt;
    </li>
);

export const view = (state$: Observable<State>) =>
    state$.pipe(
        map(state => (
            <div>
                <h1>Teams</h1>
                <ul>
                    {state.teams.map(renderTeam)}
                    <li>
                        <form className="add-form">
                            Create new team:
                            <input
                                className="name-field"
                                name="teamName"
                                type="text"
                            />
                            <input
                                className="email-field"
                                name="email"
                                type="email"
                            />
                            <button className="submit-button">Save</button>
                        </form>
                    </li>
                </ul>
            </div>
        ))
    );
