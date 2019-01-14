import { AggregateId, State, Team } from '../../domain';
import { ClientState } from './model/state';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { find } from 'lodash/fp';

const idPrefix = `teams-manage`;

const isTeamDirty = (teamId: AggregateId, state: ClientState): boolean =>
    !!find(t => t.id === teamId, state.dirtyTeams);

const renderTeam = ({ id, name, email }: Team) => (
    <li className="team" data-teamId={id}>
        <span className="name">{name}</span>&nbsp;
        <span>
            &lt;<span className="email">{email}</span>&gt;
        </span>
        &nbsp;
        <button className="edit-button">Edit</button>
    </li>
);

const renderTeamEditForm = ({ id, name, email }: Team) => (
    <li className="team-edit-form" data-teamId={id}>
        <form className="add-form">
            {id === 'new' ? 'Create new' : 'Edit'} team:
            <input
                className="name-field"
                name="teamName"
                type="text"
                value={name}
            />
            <input
                className="email-field"
                name="email"
                type="email"
                value={email}
            />
            <button className="submit-button">Save</button>
        </form>
    </li>
);

export const view = (state$: Observable<ClientState>) =>
    state$.pipe(
        map(state => (
            <div>
                <h1>Teams</h1>
                <ul>
                    {state.teams.map(team =>
                        isTeamDirty(team.id, state)
                            ? renderTeamEditForm(team)
                            : renderTeam(team)
                    )}
                    {renderTeamEditForm({ id: 'new', email: '', name: '' })}
                </ul>
            </div>
        ))
    );
