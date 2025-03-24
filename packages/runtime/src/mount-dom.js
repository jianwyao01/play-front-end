import {DOM_TYPES} from "./h";
import {setAttributes} from "./attributes"
import {addEventListeners} from "./events";
import {extractPropsAndEvents} from "./utils/props";

function createTextNode(vdom, parentEl, index) {
    const {value} = vdom;
    const textNoe = document.createTextNode(value);
    vdom.el = textNoe;

    insert(textNoe, parentEl, index);
}

function addProps(element, vdom, hostComponent) {
    const {props, attrs, events} = extractPropsAndEvents(vdom);
    vdom.listeners = addEventListeners(element, events, hostComponent);
    setAttributes(element, attrs);
}

function createElementNode(vdom, parentEl, index, hostComponent) {
    const {tag, children} = vdom;

    const element = document.createElement(tag);
    addProps(element, vdom, hostComponent)
    vdom.el = element

    children.forEach(child => mountDOM(child, element, null, hostComponent));
    insert(element, parentEl, index);
}

function createFragmentNodes(vdom, parentEl, index, hostComponent) {
    const {children} = vdom;
    vdom.el =  parentEl;

    children.forEach((child, i) => mountDOM(child, parentEl, index ? index+i : null, hostComponent));
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

function createComponentNode(vdom, parentEl, index, hostComponent) {
    const Component = vdom.tag;
    const {props, events} = extractPropsAndEvents(vdom.props);
    const component = new Component(props, events, hostComponent);
    component.mount(parentEl, index);
    vdom.component = component;
    vdom.el = component.firstElement
}

export function mountDOM(vdom, parentEl, index, hostComponent = null) {
    switch (vdom.type) {
        case DOM_TYPES.TEXT: {
            createTextNode(vdom, parentEl, index);
            break;
        }

        case DOM_TYPES.ELEMENT: {
            createElementNode(vdom, parentEl, index, hostComponent);
            break;
        }

        case DOM_TYPES.FRAGMENT: {
            createFragmentNodes(vdom, parentEl, index, hostComponent);
            break;
        }

        case DOM_TYPES.COMPONENT: {
            createComponentNode(vdom, parentEl, index, hostComponent);
            break;
        }

        default: {
            throw new Error(`Can't mount DOM of type: ${vdom.type}`)
        }
    }
}
