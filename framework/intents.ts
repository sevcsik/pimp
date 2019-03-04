export interface Intent { _type: 'intent', name: string }
export interface ViewPage extends Intent { name: 'view page' }
export type AnyBuiltinIntent = ViewPage

