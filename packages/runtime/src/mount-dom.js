import {DOM_TYPES} from "./h";
import {setAttributes} from "./attributes"
import {addEventListeners} from "./events";

function createTextNode(vdom, parentEl) {
    const {value} = vdom;
    const textNoe = document.createTextNode(value);
    vdom.el = textNoe;

    parentEl.append(textNoe);
}

function addProps(element, props, vdom) {
    const {on: events, ...attrs} = props;
    vdom.listeners = addEventListeners(element, events);
    setAttributes(element, attrs);
}

function createElementNode(vdom, parentEl) {
    const {tag, props, children} = vdom;

    const element = document.createElement(tag);
    addProps(element, props, vdom)
    vdom.el = element

    children.forEach(child => mountDOM(child, element));
    parentEl.append(element);
}

function createFragmentNodes(vdom, parentEl) {
    const {children} = vdom;
    vdom.el =  parentEl;

    children.forEach(children => mountDOM(children, parentEl));
}

export function mountDOM(vdom, parentEl) {
    switch (vdom.type) {
        case DOM_TYPES.TEXT: {
            createTextNode(vdom, parentEl);
            break;
        }

        case DOM_TYPES.ELEMENT: {
            createElementNode(vdom, parentEl);
            break;
        }

        case DOM_TYPES.FRAGMENT: {
            createFragmentNodes(vdom, parentEl);
            break;
        }

        default: {
            throw new Error(`Can't mount DOM of type: ${vdom.type}`)
        }
    }
}
