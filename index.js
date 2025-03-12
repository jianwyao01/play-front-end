// src/index.js

// utils/arrays.js
function withoutNulls(array) {
    return array.filter((item) => item !== null);
}

// h.js
const DOM_TYPES = {
    TEXT: 'TEXT',
    ELEMENT: 'ELEMENT',
    FRAGMENT: 'FRAGMENT',
};

function hString(str) {
    return {
        type: DOM_TYPES.TEXT,
        value: str,
    };
}

function hFragment(vNodes) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes)),
    };
}

function mapTextNodes(children) {
    return children.map(child => typeof child === 'string' ? hString(child) : child);
}

function h(tag, props = {}, children = []) {
    return {
        tag,
        props,
        children: mapTextNodes(withoutNulls(children)),
        type: DOM_TYPES.ELEMENT,
    };
}

// attributes.js
function setClass(el, className) {
    el.className = '';
    if (typeof className === 'string') {
        el.className = className;
    }
    if (Array.isArray(className)) {
        el.classList.add(...className);
    }
}

function setStyle(el, prop, value) {
    el.style[prop] = value;
}

function removeStyle(el, name) {
    el.style[name] = null;
}

function removeAttribute(el, name) {
    el[name] = null;
    el.removeAttribute(name);
}

function setAttribute(el, name, value) {
    if (value == null) {
        removeAttribute(el, name);
    } else if (name.startsWith('data-')) {
        el.setAttribute(name, value);
    } else {
        el[name] = value;
    }
}

function setAttributes(el, attrs) {
    const { class: className, style, ...otherAttrs } = attrs;

    if (className) {
        setClass(el, className);
    }
    if (style) {
        Object.entries(style).forEach(([prop, value]) => {
            setStyle(el, prop, value);
        });
    }
    for (const [name, value] of Object.entries(otherAttrs)) {
        setAttribute(el, name, value);
    }
}

// events.js
function addEventListener(el, event, listener) {
    el.addEventListener(event, listener);
    return listener;
}

function addEventListeners(el, events={}) {
    const addedListeners = {};
    for (const [event, listener] of Object.entries(events)) {
        addedListeners[event] = addEventListener(el, event, listener);
    }
    return addedListeners;
}

// mount-dom.js
function createTextNode(vdom, parentEl) {
    const { value } = vdom;
    const textNode = document.createTextNode(value);
    vdom.el = textNode;
    parentEl.append(textNode);
}

function addProps(element, props, vdom) {
    const { on: events, ...attrs } = props;
    vdom.listeners = addEventListeners(element, events);
    setAttributes(element, attrs);
}

function createElementNode(vdom, parentEl) {
    const { tag, props, children } = vdom;
    const element = document.createElement(tag);
    addProps(element, props, vdom);
    vdom.el = element;
    children.forEach(child => mountDOM(child, element));
    parentEl.append(element);
}

function createFragmentNodes(vdom, parentEl) {
    const { children } = vdom;
    vdom.el = parentEl;
    children.forEach(child => mountDOM(child, parentEl));
}

function mountDOM(vdom, parentEl) {
    switch (vdom.type) {
        case DOM_TYPES.TEXT:
            createTextNode(vdom, parentEl);
            break;
        case DOM_TYPES.ELEMENT:
            createElementNode(vdom, parentEl);
            break;
        case DOM_TYPES.FRAGMENT:
            createFragmentNodes(vdom, parentEl);
            break;
        default:
            throw new Error(`Can't mount DOM of type: ${vdom.type}`);
    }
}

const vdom = h('section', {}, [
    h('h1', {}, ['Hello, World']),
    h('p', {}, ['This is a paragraph']),
    h('ul', {}, [
        h('li', {}, ['Item 1']),
        h('li', {}, ['Item 2']),
        h('li', {}, ['Item 3']),
    ])
]);

const mountEle = document.getElementById('app');
mountDOM(vdom, mountEle);
console.log(mountEle);
