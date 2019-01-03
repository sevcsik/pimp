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
export interface TeamCommand extends Command { context: 'team' }
export interface CreateTeamCommand extends TeamCommand { name: 'create', teamName: string, email: string }
export interface UpdateTeamCommand extends TeamCommand { name: 'update', teamId: AggregateId, teamName: string, email: string }
export interface DeleteTeamCommand extends TeamCommand { name: 'delete', teamId: AggregateId }
export interface GetStateCommand extends TeamCommand  { name: 'get state' }
export type AnyCommand = CreateTeamCommand
                       | UpdateTeamCommand
                       | DeleteTeamCommand
                       | GetStateCommand

// Events
export interface TeamEvent extends Event  { context: 'team' }
export interface TeamCreatedEvent extends TeamEvent  { name: 'created', team: Team }
export interface TeamUpdatedEvent extends TeamEvent  { name: 'updated', team: Team }
export interface TeamDeletedEvent extends TeamEvent  { name: 'deleted' }
export type AnyEvent = TeamCreatedEvent
                     | TeamDeletedEvent
                     | TeamUpdatedEvent


// Replies
export interface GetStateReply extends Reply  { state: any }
export interface AcceptedCommandReply extends Reply  { accepted: true }
export interface InvalidCommandReply extends Reply  { error: 'invalid command' }
export interface UnknownCommandReply extends Reply  { error: 'unknown command' }
export type AnyReply = GetStateReply
                     | AcceptedCommandReply
                     | InvalidCommandReply
                     | UnknownCommandReply

// State
export type State = { teams: ReadonlyArray<Team> }

export const apply = ( state: State
                     , event: AnyEvent
                     ): State => {
	if (event.name === 'created') {
		return extend(state, { teams: concat(state.teams, event.team) })
	} else if (event.name === 'updated') {
		const teams = state.teams
		const pos = findIndex({ id: event.id }, teams)
		return extend(state, { teams: [...take(pos, teams), event.team, ...takeRight(size(teams) - pos - 1, teams)] })
	} else if (event.name === 'deleted') {
		return extend(state, { teams: filter(team => team.id !== event.id, state.teams) })
	} else {
		return state
	}
}

const validateTeam = (name: string, email: string) => includes(' ', name) && includes('@', email)

export const validateCommand = (command: AnyCommand, state: State) =>
	  command.name === 'create'
	? validateTeam(command.teamName, command.email)
		&& find(team => team.email === command.email, state.teams) === undefined
	: command.name === 'delete'
	? find(team => team.id === command.teamId, state.teams) !== undefined
	: command.name === 'get state'
	? true
	: command.name === 'update'
	? validateTeam(command.teamName, command.email)
		&& find(team => team.id === command.teamId, state.teams) !== undefined
	: false

export const initialState: State = { teams: [] }
