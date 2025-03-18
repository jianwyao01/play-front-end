export function addEventListener(el, event, listener, hostComponent = null) {
    function boundHandler() {
        hostComponent ? listener.call(hostComponent, ...arguments) : listener(...arguments);
    }

    el.addEventListener(event, boundHandler);
    return boundHandler;
}

export function addEventListeners(el, events={}, hostComponent = null) {
    const addedListeners = {};
    for (const [event, listener] of Object.entries(events)) {
        addedListeners[event] = addEventListener(el, event, listener, hostComponent);
    }
    return addedListeners;
}

export function removeEventListeners(listeners = {}, el) {
    for (const [event, listener] of Object.entries(listeners)) {
        el.removeEventListener(event, listener);
    }
}
