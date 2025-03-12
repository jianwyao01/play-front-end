console.log('Happy developing ✨')

const todos = ['Walk the dog', 'Water the plants', 'Sand the charis']

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
    span.textContent = todo;
    span.addEventListener('dblclick', () => {
        const idx = todos.indexOf(todo);
        todosList.replaceChild(removeTodoInEditMode(todo), todosList.childNodes[idx]);
    });
    li.append(span);
    const button = document.createElement('button');
    button.textContent = 'Done';
    button.addEventListener('click', () => {
        const idx = todos.indexOf(todo);
        removeTodo(idx);
    });
    li.append(button);

    return li;
}

function removeTodoInEditMode(todo) {
    const li = document.createElement('li');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = todo;
    li.append(input);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', () => {
        const idx = todos.indexOf(todo);
        updateTodo(idx, input.value);
    });
    li.append(saveButton);


    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        const idx = todos.indexOf(todo);
        todosList.replaceChild(renderTodoInReadMode(todo), todosList.childNodes[idx]);
    });
    li.append(cancelButton);

    return li;
}

function addTodo() {
    var newTodoValue = addTodoInput.value;
    todos.push(newTodoValue);
    const newTodo = renderTodoInReadMode(newTodoValue)
    todosList.append(newTodo);

    addTodoInput.value = '';
    addTodoButton.disabled = true;
}

function removeTodo(idx) {
    todos.splice(idx, 1);
    todosList.removeChild(todosList.childNodes[idx]);
}

function updateTodo(idx, value) {
    todos[idx] = value;
    const newTodo = renderTodoInReadMode(value);
    todosList.replaceChild(newTodo, todosList.childNodes[idx]);
}

