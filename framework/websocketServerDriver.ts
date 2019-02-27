import * as WebSocket from 'ws'
import { Observable, ObservableInput, from, Subscriber } from 'rxjs'
import { tag } from 'rxjs-spy/operators'
import { Stream } from 'xstream'

const tp = 'framework/webSocketServerDriver'

export function mkWebsocketServerDriver<I, O>(client: WebSocket) {
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
        // the symbol-observable polyfill makes this conversion possible, but TS does not know about it
        from(sink$ as unknown as ObservableInput<O>)
            .pipe(tag(`${tp}:outgoingMessages`))
            .subscribe(message => { client.send(JSON.stringify(message), errorHandler) })
        return incomingMessages$.pipe(tag(`${tp}:incomingMessages`))
    }
}
