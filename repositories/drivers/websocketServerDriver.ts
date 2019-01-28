import '@cycle/rxjs-run'

import * as WebSocket from 'ws'
import { Observable, ObservableInput, from, Subscriber } from 'rxjs'
import { tag } from 'rxjs-spy/operators'
import { Stream } from 'xstream'

export function makeWebsocketServerDriver<I, O>(client: WebSocket) {
    const incomingMessages$: Observable<I> = Observable.create((subscriber: Subscriber<I>) => {
        client.on('message', (message: I) => { subscriber.next(message) })
        client.on('close', () => { subscriber.complete() })
    })

    return (sink$: Stream<O>): Observable<I> => {
        from(sink$ as ObservableInput<O>) // Importing rxjs-run makes RxJS support XStream
            .pipe(tag('drivers/webSocketServerDriver:outgoingMessages'))
            .subscribe((message: O) => { client.send(JSON.stringify(message)) /* TODO: how to handle errors? */ })
        return incomingMessages$.pipe(tag('drivers/websocketServerDriver:incomingMessages'))
    }
}
