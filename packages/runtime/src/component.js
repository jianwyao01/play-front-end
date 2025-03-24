import {destroyDOM} from "./destroy-dom";
import {mountDOM} from "./mount-dom";
import {patchDOM} from "./patch-dom";
import {DOM_TYPES, extractChildren} from "./h";
import {hasOwnProperty} from "./utils/objects";
import equal from "fast-deep-equal";
import {Dispatcher} from "./dispatcher";

const emptyFn = () => {};

export function defineComponent({render, state, onMounted = emptyFn, onUnmounted = emptyFn, ...methods}) {
    class Component {
        #isMounted = false;
        #vdom = null;
        #hostEl = null;
        #eventHandlers = null;
        #parentComponent = null;
        #dispatcher = new Dispatcher();
        #subscriptions = [];

        constructor(props = {}, eventHandlers = {}, parentComponent = null) {
            this.props = props;
            this.state = state ? state(props) : {};
            this.#eventHandlers = eventHandlers;
            this.#parentComponent = parentComponent;
        }

        #wireEventHandlers() {
            this.#subscriptions = Object.entries(this.#eventHandlers)
                .map(([eventName, handler]) => this.#wireEventHandler(eventName, handler))
        }

        #wireEventHandler(eventName, handler) {
            return this.#dispatcher.subscribe(eventName, (payload) => {
                if (this.#parentComponent) {
                    handler.call(this.#parentComponent, payload);
                } else {
                    handler(payload);
                }
            })
        }

        updateState(state) {
            this.state = {
                ...this.state,
                ...state,
            }
            this.#patch()
        }

        updateProps(props) {
            const newProps = {
                ...this.props,
                ...props,
            }

            if (equal(this.props, newProps)) {
                return
            }
            this.props = newProps;
            this.#patch()
        }

        get elements() {
            if (this.#vdom == null) {
                return []
            }

            if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
                return extractChildren(this.#vdom).flatMap(child => {
                    if (child.type === DOM_TYPES.COMPONENT) {
                        return child.component.elements;
                    }

                    return [child.el];
                })
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

        emit(eventName, payload) {
            this.#dispatcher.dispatch(eventName, payload)
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
            this.#wireEventHandlers();

            this.#isMounted = true;
            this.#hostEl = hostEl;
        }

        onMounted() {
            return Promise.resolve(onMounted.call(this));
        }

        onUnmounted() {
            return Promise.resolve(onUnmounted.call(this));
        }

        #patch() {
            if (!this.#isMounted) {
                throw new Error('Component is not mounted');
            }

            const newVdom = this.render();
            this.#vdom = patchDOM(this.#vdom, newVdom, this.#hostEl, this);
        }

        unmount() {
            if (!this.#isMounted) {
                throw new Error('Component is not mounted');
            }

            destroyDOM(this.#vdom);
            this.#subscriptions.forEach(unsubscribe => unsubscribe());

            this.#vdom = null;
            this.#hostEl = null;
            this.#isMounted = false;
            this.#subscriptions = [];
        }
    }

    for (const methodName in methods) {
        if (hasOwnProperty(Component, methodName)) {
            throw new Error(`Method ${methodName} is already existed in a component`);
        }
        Component.prototype[methodName] = methods[methodName];
    }

    return Component;
}
