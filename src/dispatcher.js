export class Dispatcher {

    #subs = new Map();
    #afterHandlers = [];

    dispatch(commandName, payload) {
        if (this.#subs.has(commandName)) {
            this.#subs.get(commandName).forEach((handler) => handler(payload));
        } else {
            console.warn(`No handler for command: ${commandName}`);
        }

        this.#afterHandlers.forEach((handler) => handler());
    }

    subscribe(commandName, handler) {
        if (!this.#subs.has(commandName)) {
            this.#subs.set(commandName, []);
        }

        const handlers = this.#subs.get(commandName);
        if (handlers.includes(handler)) {
            return () => {};
        }

        handlers.push(handler);

        return () => {
            const idx = handlers.indexOf(handler);
            handlers.splice(idx, 1);
        }
    }

    afterEveryCommand(handler) {
        this.#afterHandlers.push(handler);

        return () => {
            const idx = this.#afterHandlers.indexOf(handler);
            this.#afterHandlers.splice(idx, 1);
        }
    }
}

// const dispatcher = new Dispatcher()
// dispatcher.subscribe('greet', (name) => {
//     console.log(`Hello, ${name}!`)
// })
// dispatcher.afterEveryCommand(() => {
//     console.log('Done greeting!')
// })
// dispatcher.dispatch('greet', 'John')
