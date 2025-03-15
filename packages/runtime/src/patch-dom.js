import {destroyDOM} from "./destroy-dom";
import {mountDOM} from "./mount-dom";
import {areNodesEqual} from "./nodes-equal";
import {DOM_TYPES} from "./h";
import {removeAttribute, removeStyle, setAttribute, setStyle} from "./attributes";
import {objectsDiff} from "./utils/objects";
import {ARRAY_DIFF_OP, arrayDiffSequence, arraysDiff} from "./utils/arrays";
import {isNotBlankOrEmptyString} from "./utils/strings";
import {addEventListener} from "./events";

export function patchDOM(oldVdom, newVdom, parentEl) {
    if (!areNodesEqual(oldVdom, newVdom)) {
        const index = findIndexInParent(parentEl, oldVdom.el);
        destroyDOM(oldVdom);
        mountDOM(newVdom, parentEl, index);

        return newVdom;
    }

    newVdom.el = oldVdom.el;

    switch (newVdom.type) {
        case DOM_TYPES.TEXT: {
            patchText(oldVdom, newVdom);
            return newVdom
        }

        case DOM_TYPES.ELEMENT: {
            patchElement(oldVdom, newVdom);
            break;
        }
    }

    patchChildren(oldVdom, newVdom);

    return newVdom;
}

function patchText(oldVdom, newVdom) {
    const {el} = oldVdom;
    const {value: oldText} = oldVdom;
    const {value: newText} = newVdom;
    if (oldText !== newText) {
        el.nodeValue = newText;
    }
}

function patchElement(oldVdom, newVdom) {
    const el = oldVdom.el;
    const {
        class: oldClass,
        style: oldStyle,
        on: oldEvents,
        ...oldAttrs
    } = oldVdom.props;

    const {
        class: newClass,
        style: newStyle,
        on: newEvents,
        ...newAttrs
    } = newVdom.props;

    const {listeners: oldListeners} = oldVdom;

    patchAttrs(el, oldAttrs, newAttrs);
    patchClasses(el, oldClass, newClass);
    patchStyles(el, oldStyle, newStyle);
    newVdom.listeners = patchEvents(el, oldListeners, oldEvents, newEvents);
}

function patchAttrs(el, oldAttrs, newAttrs) {
    const {added, removed, updated} = objectsDiff(oldAttrs, newAttrs);

    for (const attr of removed) {
        removeAttribute(el, attr);
    }

    for (const attr of added.concat(updated)) {
        setAttribute(el, attr, newAttrs[attr]);
    }
}

function patchClasses(el, oldClass, newClass) {
    const oldClasses = toClassList(oldClass);
    const newClasses = toClassList(newClass);

    const {added, removed} = arraysDiff(oldClasses, newClasses);

    if (removed.length > 0) {
        el.classList.remove(...removed)
    }

    if (added.length > 0) {
        el.classList.add(...added)
    }
}

function toClassList(classNames = '') {
    return Array.isArray(classNames) ?
        classNames.filter(isNotBlankOrEmptyString) :
        classNames.split(/(\s+)/).filter(isNotBlankOrEmptyString);
}

function patchStyles(el, oldStyle = {}, newStyle = {}) {
    const {added, updated, removed} = objectsDiff(oldStyle, newStyle);

    for (const style of removed) {
        removeStyle(el, style);
    }

    for (const style of added.concat(updated)) {
        setStyle(el, style, newStyle[style]);
    }
}

function patchEvents(el, oldListeners = {}, oldEvents = {}, newEvents = {}) {
    const {removed, added, updated} = objectsDiff(oldEvents, newEvents)

    for (const eventName of removed.concat(updated)) {
        el.removeEventListener(eventName, oldListeners[eventName]);
    }

    const addedListeners = {};

    for (const eventName of added.concat(updated)) {
        const listener = addEventListener(el, eventName, newEvents[eventName]);
        addedListeners[eventName] = listener;
    }

    return addedListeners;
}

function patchChildren(oldVdom, newVdom) {
    const oldChilren = oldVdom.children;
    const newChildren = newVdom.children;
    const parentEl = oldVdom.el;

    const diffSeq = arrayDiffSequence(oldChilren, newChildren, areNodesEqual);

    for (const operation of diffSeq) {
        const {originalIndex, from, index, item} = operation;

        switch (operation.op) {
            case ARRAY_DIFF_OP.ADD: {
                mountDOM(item, parentEl, index);
                break;
            }

            case ARRAY_DIFF_OP.REMOVE: {
                destroyDOM(item);
                break;
            }

            case ARRAY_DIFF_OP.MOVE: {
                const oldChild = oldChilren[originalIndex];
                const newChild = newChildren[index];

                const el = oldChild.el;
                const elAtTargetIndex = parentEl.childNodes[index];

                parentEl.insertBefore(el, elAtTargetIndex);
                patchDOM(oldChild, newChild, parentEl);

                break;
            }

            case ARRAY_DIFF_OP.NOOP: {
                patchDOM(oldChilren[originalIndex], newChildren[index], parentEl);
                break;
            }
        }
    }

}

function findIndexInParent(parentEl, el) {
    const index =  Array.from(parentEl.children).indexOf(el);
    if (index === -1) {
        return null;
    }

    return index;
}
