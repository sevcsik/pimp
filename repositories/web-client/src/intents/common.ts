export interface Intent {
    name: string;
    type: 'intent';
}

export function isAnyIntent(obj: any): obj is Intent {
    return obj.type === 'intent';
}

export function isIntent<T extends Intent>(intentName: string) {
    return function isIntent(obj: any): obj is T {
        return isAnyIntent(obj) && obj.name === intentName;
    };
}
