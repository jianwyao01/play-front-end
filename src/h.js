import {withoutNulls} from './utils/arrays'

export const DOM_TYPES = {
    TEXT: 'TEXT',
    ELEMENT: 'ELEMENT',
    FRAGMENT: 'FRAGMENT',
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


/**
    h('form', { class: 'login-form', action: 'login'}, [
        h('input', { type: 'text', name: 'username', placeholder: 'Username' }),
        h('input', { type: 'password', name: 'password', placeholder: 'Password' }),
        h('button', { on: {click: login } }, ['Login']),
    ])
*/
export function h(tag, props = {}, children = []) {
    return {
        tag,
        props,
        children: mapTextNodes(withoutNulls(children)),
        type: DOM_TYPES.ELEMENT,
    }
}
