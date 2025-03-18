import {destroyDOM} from "./destroy-dom";
import {mountDOM} from "./mount-dom";
import {patchDOM} from "./patch-dom";

export function defineComponent({render, state}) {
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

        render() {
            return render.call(this)
        }

        mount(hostEl, index = null) {
            if (this.#isMounted) {
                throw new Error('Component is already mounted');
            }

            this.#vdom = this.render();
            mountDOM(this.#vdom, hostEl, index);

            this.#isMounted = true;
            this.#hostEl = hostEl;
        }

        #patch() {
            if (!this.#isMounted) {
                throw new Error('Component is not mounted');
            }

            const newVdom = this.render();
            this.#vdom = patchDOM(this.#vdom, newVdom, this.#hostEl);
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

    return Component;
}
