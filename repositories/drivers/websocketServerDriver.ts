import * as WebSocket from 'ws'
import { Observable, ObservableInput, from, Subscriber } from 'rxjs'
import { tag } from 'rxjs-spy/operators'
import { Stream } from 'xstream'

export function makeWebsocketServerDriver<I, O>(client: WebSocket) {
    let errorHandler: (error: Error) => void

    const incomingMessages$: Observable<I> = Observable.create((subscriber: Subscriber<I>) => {
        errorHandler = (error: Error) => { error && subscriber.error(error) }
        client.on('message', (message: string) => {
            try {
                subscriber.next(JSON.parse(message) as I)
            } catch (err) {
                client.send({ error: 'invalid json', reason: err.message, json: message })
            }
        })
        client.on('close', () => { subscriber.complete() })
    })

    return (sink$: Stream<O>): Observable<I> => {
        from(sink$ as ObservableInput<O>) // Importing rxjs-run makes RxJS support XStream
            .pipe(tag('drivers/webSocketServerDriver:outgoingMessages'))
            .subscribe(message => { client.send(JSON.stringify(message), errorHandler) })
        return incomingMessages$.pipe(tag('drivers/websocketServerDriver:incomingMessages'))
    }
}
