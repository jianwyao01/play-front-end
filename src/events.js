export function addEventListener(el, event, listener) {
    el.addEventListener(event, listener);
    return listener;
}

export function addEventListeners(el, events={}) {
    const addedListeners = {};
    for (const [event, listener] of Object.entries(events)) {
        addedListeners[event] = addEventListener(el, event, listener);
    }
    return addedListeners;
}

export function removeEventListeners(listeners = {}, el) {
    for (const [event, listener] of Object.entries(listeners)) {
        el.removeEventListener(event, listener);
    }
}
