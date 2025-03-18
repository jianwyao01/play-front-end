import {destroyDOM} from "./destroy-dom";
import {mountDOM} from "./mount-dom";
import {patchDOM} from "./patch-dom";
import {DOM_TYPES, extractChildren} from "./h";
import {hasOwnProperty} from "./utils/objects";


export function defineComponent({render, state, ...methods}) {
    class Component {
        #isMounted = false;
        #vdom = null;
        #hostEl = null;

        constructor(props = {}) {
            this.props = props;
            this.state = state ? state(props) : {};
        }

        updateState(state) {
            this.state = {
                ...this.state,
                ...state,
            }
            this.#patch()
        }

        get elements() {
            if (this.#vdom == null) {
                return []
            }

            if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
                return extractChildren(this.#vdom).map(child => child.el)
            }

            return [this.#vdom.el]
        }

        get firstElement() {
            return this.elements[0]
        }

        get offset() {
            if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
                return Array.from(this.#hostEl.childNodes).indexOf(this.firstElement)
            }

            return 0;
        }

        render() {
            return render.call(this)
        }

        mount(hostEl, index = null) {
            if (this.#isMounted) {
                throw new Error('Component is already mounted');
            }

            this.#vdom = this.render();
            mountDOM(this.#vdom, hostEl, index, this);

            this.#isMounted = true;
            this.#hostEl = hostEl;
        }

        #patch() {
            if (!this.#isMounted) {
                throw new Error('Component is not mounted');
            }

            const newVdom = this.render();
            this.#vdom = patchDOM(this.#vdom, newVdom, this.#hostEl, this);
        }

        umount() {
            if (!this.#isMounted) {
                throw new Error('Component is not mounted');
            }

            destroyDOM(this.#vdom);

            this.#vdom = null;
            this.#hostEl = null;
            this.#isMounted = false;
        }
    }

    for (const methodName in methods) {
        if (hasOwnProperty(methods, methodName)) {
            throw new Error(`Method ${methodName} is already existed in a component`);
        }
        Component.prototype[methodName] = methods[methodName];
    }

    return Component;
}
