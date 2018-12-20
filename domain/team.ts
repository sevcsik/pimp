import { AggregateId, AggregateRoot, Event, Command } from './common'

import { includes, negate, replace } from 'lodash/fp'

export type Email = string
export type Team = AggregateRoot & { name: string, email: Email }
export const validateTeam = (name: string, email: string): boolean => includes(' ', name) && includes('@', email)

// Events
type TeamEvent = Event & { context: 'team' }
export type TeamCreatedEvent = TeamEvent & { name: 'created', team: Team }
export type TeamUpdatedEvent = TeamEvent & { name: 'updated', team: Team }
export type TeamDeletedEvent = TeamEvent & { name: 'deleted' }

// Commands
type TeamCommand = Command & { context: 'team' }
export type CreateTeamCommand = TeamCommand & { name: 'create', teamName: string, email: string }
export type UpdateTeamCommand = TeamCommand & { name: 'update', teamId: AggregateId, teamName: string, email: string }
export type DeleteTeamCommand = TeamCommand & { name: 'delete', teamId: AggregateId }


