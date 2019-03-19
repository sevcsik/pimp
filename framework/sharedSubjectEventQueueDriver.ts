import { from, Observable, ObservableInput, ReplaySubject } from 'rxjs'
import { tag } from 'rxjs-spy/operators'
import { Stream } from 'xstream'

const tp = 'framework/inMemoryEventQueueDriver'

export function mkSharedSubjectEventQueueDriver<AnyEvent>(queue: ReplaySubject<AnyEvent>) {
    return (sink$: Stream<AnyEvent>): Observable<AnyEvent> => {
        // the symbol-observable polyfill makes this conversion possible, but TS does not know about it
        from(sink$ as unknown as ObservableInput<AnyEvent>)
            .pipe(tag(`${tp}:outgoingEvents`))
            .subscribe(queue)

        return queue.pipe(tag(`${tp}:incomingEvents`))
    }
}
