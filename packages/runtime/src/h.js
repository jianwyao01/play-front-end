import {withoutNulls} from './utils/arrays'

export const DOM_TYPES = {
    TEXT: 'TEXT',
    ELEMENT: 'ELEMENT',
    FRAGMENT: 'FRAGMENT',
    COMPONENT: 'COMPONENT',
}

export function hString(str) {
    return {
        type: DOM_TYPES.TEXT,
        value: str,
    }
}

export function hFragment(vNodes) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes)),
    }
}

function mapTextNodes(children) {
    return children.map(child => typeof child === 'string' ? hString(child) : child)
}

export function h(tag, props = {}, children = []) {
    const type = typeof tag === 'string' ? DOM_TYPES.ELEMENT : DOM_TYPES.COMPONENT;


    return {
        tag,
        props,
        children: mapTextNodes(withoutNulls(children)),
        type,
    }
}

export function extractChildren(vdom) {
    if (vdom.children == null) {
        return [];
    }

    const children = [];

    for (const child of vdom.children) {
        if (child.type === DOM_TYPES.FRAGMENT) {
            children.push(...extractChildren((child.children)));
        }
    }

    return children;
}
