export interface Intent { _type: 'intent', name: string }
export interface View extends Intent { name: 'builtin view' }
export type AnyBuiltinIntent = View

