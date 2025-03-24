export function readTodos() {
    const todos = localStorage.getItem('todos');
    console.log("read:", todos)

    if (todos === 'undefined' || todos === null) {
        return [];
    }
    return JSON.parse(todos)
}

export function writeTodos(todos) {
    console.log("todos:", todos)
    localStorage.setItem('todos', JSON.stringify(todos))
}
