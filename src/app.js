import {destroyDOM} from "./destroy-dom";
import {mountDOM} from "./mount-dom";

export function createApp({state, view}) {
    let parentEl = null;
    let vdom = null;

    function renderApp() {
        if (vdom) {
            destroyDOM(vdom);
        }

        vdom = view(state);
        mountDOM(vdom, parentEl);
    }

    return {
        mount(_parentEl) {
            parentEl = _parentEl;
            renderApp();
        }
    }
}
