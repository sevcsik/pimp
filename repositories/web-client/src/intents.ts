import { Intent } from '@pimp/framework/client';

export interface EditRepositoryIntent extends Intent {
    name: 'edit repository';
}
export type AnyIntent = EditRepositoryIntent;
