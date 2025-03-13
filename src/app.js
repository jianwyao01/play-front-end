import {destroyDOM} from "./destroy-dom";
import {Dispatcher} from "./dispatcher";
import {mountDOM} from "./mount-dom";

export function createApp({state, view, reducers}) {
    let parentEl = null;
    let vdom = null;

    const dispatcher = new Dispatcher();
    const subscriptions = [dispatcher.afterEveryCommand(renderApp)];

    function emit(eventName, payload) {
        dispatcher.dispatch(eventName, payload);
    }

    for (const eventName of reducers) {
        const reducer = reducers[eventName];

        const subs = dispatcher.subscribe(eventName, (payload) => {
            state = reducer(state, payload);
        });
        subscriptions.push(subs);
    }

    function renderApp() {
        if (vdom) {
            destroyDOM(vdom);
        }

        vdom = view(state, emit);
        mountDOM(vdom, parentEl);
    }

    return {
        mount(_parentEl) {
            parentEl = _parentEl;
            renderApp();
        },
        unmount() {
            destroyDOM(vdom);
            vdom = null;
            subscriptions.forEach((unsubscribe) => unsubscribe());
        }
    }
}
