import { AggregateId
       , AggregateRoot
       , Event
       , Command
       , Reply
       } from './common'

import { concat
       , extend
       , filter
       , find
       , findIndex
       , includes
       , size
       , take
       , takeRight
       } from 'lodash/fp'

export * from './common'

export type Email = string
export type Team = AggregateRoot & { name: string, email: Email }

// Commands
export type TeamCommand = Command & { context: 'team' }
export type CreateTeamCommand = TeamCommand & { name: 'create', teamName: string, email: string }
export type UpdateTeamCommand = TeamCommand & { name: 'update', teamId: AggregateId, teamName: string, email: string }
export type DeleteTeamCommand = TeamCommand & { name: 'delete', teamId: AggregateId }
export type GetStateCommand = TeamCommand & { name: 'get state' }

// Events
export type TeamEvent = Event & { context: 'team' }
export type TeamCreatedEvent = TeamEvent & { name: 'created', team: Team }
export type TeamUpdatedEvent = TeamEvent & { name: 'updated', team: Team }
export type TeamDeletedEvent = TeamEvent & { name: 'deleted' }
export type AllEvents = TeamCreatedEvent
                      | TeamDeletedEvent
                      | TeamUpdatedEvent


// Replies
export type GetStateReply = Reply & { state: any }
export type InvalidCommandreply = Reply & { error: 'invalid command' }
export type UnknownCommandreply = Reply & { error: 'unknown command' }

// State
export type State = { teams: ReadonlyArray<Team> }

export const apply = ( state: State
                     , event: AllEvents
                     ): State => {
	if (event.name === 'created') {
		// TODO: why doesn't control flow analysis work?
		event = event as TeamCreatedEvent
		return extend(state, { teams: concat(state.teams, event.team) })
	} else if (event.name === 'updated') {
		event = event as TeamUpdatedEvent
		const teams = state.teams
		const pos = findIndex({ id: event.id }, teams)
		return extend(state, { teams: [...take(pos, teams), event.team, ...takeRight(size(teams) - pos - 1, teams)] })
	} else if (event.name === 'deleted') {
		event = event as TeamDeletedEvent
		return extend(state, { teams: filter(team => team.id !== event.id, state.teams) })
	} else {
		return state
	}
}

export const validate = (name: string, email: string, existingTeams: ReadonlyArray<Team>): boolean => {
	return includes(' ', name) && includes('@', email) && find(team => team.id === email, existingTeams) === undefined
}

export const initialState: State = { teams: [] }
