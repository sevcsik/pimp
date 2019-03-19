import { Repository } from '../../shared/objects';
import { State, UnsavedRepository } from './state';

import { find, map } from 'lodash/fp';
import { VNode } from '@cycle/dom';

const renderRepository = (
    { id, name, provider }: Repository,
    unsaved?: UnsavedRepository
) =>
    unsaved ? (
        <li>
            <pimp-repository-edit data-id={id}>
                <input className="name-field" value="{unsaved.fields.name}" />
                <input
                    className="provider-field"
                    value="{unsaved.fields.provider}"
                />
                <button className="submit-button">Submit</button>
                <button className="discard-button">Discard</button>
            </pimp-repository-edit>
        </li>
    ) : (
        <li>
            <pimp-repository data-id={id}>
                <span className="name-field">{name}</span>
                <span className="provider-field">{provider}</span>
                <button className="edit-button">Edit</button>
                <button className="delete-button">Delete</button>
            </pimp-repository>
        </li>
    );

const findUnsaved = (repo: Repository, state: State) =>
    find({ id: repo.id }, state.unsavedRepositories);

export const renderState = (state: State) => (
    <div>
        <h1>Repositories</h1>
        <ul>
            {map(
                repo => renderRepository(repo, findUnsaved(repo, state)),
                state.repositories
            )}
        </ul>
    </div>
);
