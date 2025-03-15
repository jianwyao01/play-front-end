export function withoutNulls(array) {
    return array.filter((item) => item !== null)
}

export function arraysDiff(oldArray, newArray) {
    return {
        added: newArray.filter(item => !oldArray.includes(item)),
        removed: oldArray.filter(item => !newArray.includes(item)),
    }
}

export const ARRAY_DIFF_OP = {
    ADD: 'add',
    REMOVE: 'remove',
    MOVE: 'move',
    NOOP: 'noop',
}

class ArrayWithOriginalIndices {
    #array = []
    #originalIndices = []
    #equalFn

    constructor(array, equalFn) {
        this.#array = [...array]
        this.#equalFn = equalFn
        this.#originalIndices = array.map((_, index) => index)
    }

    get length() {
        return this.#array.length
    }

    isRemoval(index, newArray) {
        if (index >= this.length) {
            return false
        }

        const item = this.#array[index]
        const indexInNewArray = newArray.findIndex((newItem) => this.#equalFn(item, newItem))

        return indexInNewArray === -1
    }

    removeItem(index) {
        const operation = {
            op: ARRAY_DIFF_OP.REMOVE,
            index,
            item: this.#array[index],
        }

        this.#array.splice(index, 1)
        this.#originalIndices.splice(index, 1)

        return operation
    }

    isNoop(index, newArray) {
        if (index >= this.length) {
            return false;
        }

        const item = this.#array[index];
        const newItem = newArray[index];
        return this.#equalFn(item, newItem);
    }

    originalIndexAt(index) {
        return this.#originalIndices[index];
    }

    noopItem(index) {
        return {
            op: ARRAY_DIFF_OP.NOOP,
            originalIndex: this.originalIndexAt(index),
            index,
            item: this.#array[index],
        }
    }

    isAddition(item, fromIdx) {
        return this.findIndexFromIndex(item, fromIdx) === -1;
    }

    findIndexFromIndex(item, fromIdx) {
        for (let i = fromIdx; i < this.length; i++) {
            if (this.#equalFn(item, this.#array[i])) {
                return i;
            }
        }

        return -1;
    }

    addItem(item, index) {
         const operation = {
             op: ARRAY_DIFF_OP.ADD,
             index,
             item
         }

         this.#array.splice(index, 0, item);
         this.#originalIndices.splice(index, 0, -1);

         return operation;
    }

    moveItem(item, toIndex) {
        const fromIndex = this.findIndexFromIndex(item, toIndex);

        const operation = {
            op: ARRAY_DIFF_OP.MOVE,
            originalIndex: this.originalIndexAt(fromIndex),
            from: fromIndex,
            index: toIndex,
            item: this.#array[fromIndex],
        }

        const [_item] = this.#array.splice(fromIndex, 1);
        this.#array.splice(toIndex, 0, _item);

        const [originalIndex] = this.#originalIndices.splice(fromIndex, 1);
        this.#originalIndices.splice(toIndex, 0, originalIndex);

        return operation;
    }

    removeItemsAfter(index) {
        const operations = [];

        while (this.length > index) {
            operations.push(this.removeItem(index));
        }

        return operations;
    }

}

export function arrayDiffSequence(
    oldArray,
    newArray,
    equalFn = (a, b) => a === b
) {
    const sequence = []
    const array = new ArrayWithOriginalIndices(oldArray, equalFn)

    for (let i = 0; i < newArray.length; i++) {
        // remove
        if (array.isRemoval(i, newArray)) {
            sequence.push(array.removeItem(i));
            i --;
            continue;
        }

        // noop
        if (array.isNoop(i, newArray)) {
            sequence.push(array.noopItem(i));
            continue;
        }

        // add
        const item = newArray[i];

        if (array.isAddition(item, i)) {
            sequence.push(array.addItem(item, i));
            continue;
        }

        // move
        sequence.push(array.moveItem(item, i));

    }

    // move extra items
    sequence.push(...array.removeItemsAfter(newArray.length));

    return sequence;
}

// const oldArray = ['A', 'A', 'B', 'C']
// const newArray = ['C', 'K', 'A', 'B']
// const result =  arrayDiffSequence(oldArray, newArray)
// console.log(result)
