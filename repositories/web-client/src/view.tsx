import { Repository } from '../../shared/objects';
import { State, UnsavedRepository } from './state';

import { find, filter, flow, map } from 'lodash/fp';
import { VNode } from '@cycle/dom';

const renderUnsavedRepository = ({
    id,
    fields: { name, provider }
}: UnsavedRepository) => (
    <pimp-repository-edit data-id={id}>
        <input
            className="name-field"
            placeholder="Repository name"
            value={name}
        />
        <input className="provider-field" value={provider} />
        <button className="submit-button">Submit</button>
        <button className="discard-button">Discard</button>
    </pimp-repository-edit>
);

const renderRepository = ({ id, name, provider }: Repository) => (
    <pimp-repository data-id={id}>
        <span className="name-field">{name}</span>
        <span className="provider-field">{provider}</span>
        <button className="edit-button">Edit</button>
        <button className="delete-button">Delete</button>
    </pimp-repository>
);

const renderExistingRepository = (repository: Repository, state: State) => {
    const unsaved = findUnsaved(repository, state);
    return unsaved
        ? renderUnsavedRepository(unsaved)
        : renderRepository(repository);
};

const findUnsaved = (repo: Repository, state: State) =>
    find({ id: repo.id }, state.unsavedRepositories);

export const renderState = (state: State) => (
    <div>
        <h1>Repositories</h1>
        <ul>
            {map(
                repo => (
                    <li>{renderExistingRepository(repo, state)}</li>
                ),
                state.repositories
            )}
            {flow(
                filter<UnsavedRepository>(
                    unsavedRepo => unsavedRepo.id === null
                ),
                map(unsavedRepo => (
                    <li>{renderUnsavedRepository(unsavedRepo)}</li>
                ))
            )(state.unsavedRepositories)}
        </ul>
        <button className="create-button">Create</button>
    </div>
);
