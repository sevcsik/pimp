import { webSocket } from 'rxjs/webSocket';
import { Stream } from 'xstream';

export const makeWebsocketDriver = (url: string) => {
    const webSocket$ = webSocket(url);
    return (sink$: Stream<any>) => {
        sink$.subscribe({
            next: (message: any) => {
                webSocket$.next(message);
            }
        });
        return webSocket$.asObservable();
    };
};
