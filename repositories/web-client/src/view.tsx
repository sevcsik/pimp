import { Repository } from '../../shared/objects';
import { State } from './state';

import { VNode } from '@cycle/dom';

const renderRepository = ({ id, name, provider }: Repository) => (
    <li>
        <pimp-repository data-id={id}>
            <span className="name-field">{name}</span>
            <span className="provider-field">{provider}</span>
            <button className="edit-button">Edit</button>
            <button className="delete-button">Delete</button>
        </pimp-repository>
    </li>
);

export const renderState = (state: State) => (
    <div>
        <h1>Repositories</h1>
        <ul>state.repositories.map(renderRepository)</ul>
    </div>
);
