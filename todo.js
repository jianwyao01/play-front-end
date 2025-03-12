console.log('Happy developing ✨')

let index = 0;

const todos = [
    {
        "label": "Walk the dog",
        "done": false
    },
    {
        "label": "Water the plants",
        "done": false
    },
    {
        "label": "Sand the chairs",
        "done": false
    }
]

const addTodoInput = document.getElementById('todo-input')
const addTodoButton = document.getElementById('add-todo-btn')
const todosList = document.getElementById('todos-list')

for (const todo of todos) {
    todosList.append(renderTodoInReadMode(todo))
}

addTodoInput.addEventListener('input', () => {
    addTodoButton.disabled = addTodoInput.value.length < 3
})

addTodoInput.addEventListener('keydown', ({ key }) => {
    if (key === 'Enter' && addTodoInput.value.length >= 3) {
        addTodo()
    }
})

addTodoButton.addEventListener('click', () => {
    addTodo()
})

function renderTodoInReadMode(todo) {
    const li = document.createElement('li')
    const span = document.createElement('span');
    span.textContent = todo.label;
    span.style.textDecoration = todo.done ? 'line-through' : '';

    if (todo.done) {
        li.append(span);
        return li;
    }

    span.addEventListener('dblclick', () => {
        const idx = todos.indexOf(todo);
        todosList.replaceChild(removeTodoInEditMode(todo), todosList.childNodes[idx]);
    });
    li.append(span);

    const button = document.createElement('button');
    button.textContent = 'Done';
    button.addEventListener('click', () => {
        const idx = findTodoIndex(todo);
        removeTodo(idx);
    });
    li.append(button);

    return li;
}

function findTodoIndex(todo) {
    return todos.findIndex(t => t.label === todo.label);
}

function removeTodoInEditMode(todo) {
    const li = document.createElement('li');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = todo.label;
    li.append(input);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', () => {
        const idx = findTodoIndex(todo);
        updateTodo(idx, input.value);
    });
    li.append(saveButton);


    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        const idx = findTodoIndex(todo);
        todosList.replaceChild(renderTodoInReadMode(todo), todosList.childNodes[idx]);
    });
    li.append(cancelButton);

    return li;
}

function existsTodo(newTodoLabel) {
    return todos.some(t => t.label === newTodoLabel);
}

function readAloud(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
}

function addTodo() {
    const newTodoValue = addTodoInput.value;
    if (existsTodo(newTodoValue)) {
        alert('Todo already exists');
        return;
    }

    const newTodo = {
        label: newTodoValue,
        done: false
    }
    todos.push(newTodo);
    const newTodoElement = renderTodoInReadMode(newTodo);
    todosList.append(newTodoElement);

    readAloud(newTodo.label);

    addTodoInput.value = '';
    addTodoButton.disabled = true;
}

function removeTodo(idx) {
    const oldTodo = todos[idx]
    const newTodo = {
        ...oldTodo,
        done: true
    }
    todos[idx] = newTodo;
    todosList.replaceChild(renderTodoInReadMode(newTodo), todosList.childNodes[idx]);
}

function updateTodo(idx, value) {
    const oldTodo = todos[idx];
    const newTodo = {
        ...oldTodo,
        label: value
    }
    todos[idx] = newTodo;
    todosList.replaceChild(renderTodoInReadMode(newTodo), todosList.childNodes[idx]);
}

