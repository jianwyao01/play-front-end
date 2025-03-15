import {DOM_TYPES} from "./h";
import {setAttributes} from "./attributes"
import {addEventListeners} from "./events";

function createTextNode(vdom, parentEl, index) {
    const {value} = vdom;
    const textNoe = document.createTextNode(value);
    vdom.el = textNoe;

    insert(textNoe, parentEl, index);
}

function addProps(element, props, vdom) {
    const {on: events, ...attrs} = props;
    vdom.listeners = addEventListeners(element, events);
    setAttributes(element, attrs);
}

function createElementNode(vdom, parentEl, index) {
    const {tag, props, children} = vdom;

    const element = document.createElement(tag);
    addProps(element, props, vdom)
    vdom.el = element

    children.forEach(child => mountDOM(child, element));
    insert(element, parentEl, index);
}

function createFragmentNodes(vdom, parentEl, index) {
    const {children} = vdom;
    vdom.el =  parentEl;

    children.forEach((child, i) => mountDOM(child, parentEl, index ? index+i : null));
}

function insert(el, parentEl, index) {
    if (index == null) {
        parentEl.append(el);
        return;
    }

    if (index < 0) {
        throw new Error('Invalid index, index must be greater than or equal to 0');
    }

    const children = parentEl.children;
    if (index >= children.length) {
        parentEl.append(el)
    } else {
        parentEl.insertBefore(el, children[index]);
    }
}

export function mountDOM(vdom, parentEl, index) {
    switch (vdom.type) {
        case DOM_TYPES.TEXT: {
            createTextNode(vdom, parentEl, index);
            break;
        }

        case DOM_TYPES.ELEMENT: {
            createElementNode(vdom, parentEl, index);
            break;
        }

        case DOM_TYPES.FRAGMENT: {
            createFragmentNodes(vdom, parentEl, index);
            break;
        }

        default: {
            throw new Error(`Can't mount DOM of type: ${vdom.type}`)
        }
    }
}
