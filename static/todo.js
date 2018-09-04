var timeString = function(timestamp) {
    t = new Date(timestamp * 1000)
    t = t.toLocaleTimeString()
    return t
}

var todoTemplate = function(todo) {
    var title = todo.title
    var id = todo.id
    var ut = timeString(todo.ut)
    // data-xx
    // d.dataset.id
    var t = `
        <div class="todo-cell" id='todo-${id}' data-id="${id}">
            <button class="todo-edit">编辑</button>
            <button class="todo-delete">删除</button>
            <span class='todo-title'>${title}</span>
            <time class='todo-ut'>${ut}</time>
        </div>
    `
    return t
}

var insertTodo = function(todo) {
    var todoCell = todoTemplate(todo)
    var todoList = e('.todo-list')
    todoList.insertAdjacentHTML('beforeend', todoCell)
}

var insertEditForm = function(cell) {
    var form = `
        <div class='todo-edit-form'>
            <input class="todo-edit-input">
            <button class='todo-update'>更新</button>
        </div>
    `
    cell.insertAdjacentHTML('beforeend', form)
}

var loadTodos = function() {
    apiTodoAll(function(r) {
        var todos = JSON.parse(r)
        for(var i = 0; i < todos.length; i++) {
            var todo = todos[i]
            insertTodo(todo)
        }
    })
}

var bindEventTodoAdd = function() {
    var b = e('#id-button-add')
    b.addEventListener('click', function(){
        var input = e('#id-input-todo')
        var title = input.value
        log('click add', title)
        var form = {
            'title': title,
        }
        apiTodoAdd(form, function(r) {
            var todo = JSON.parse(r)
            insertTodo(todo)
        })
    })
}

var bindEventTodoDelete = function() {
    var todoList = e('.todo-list')
    todoList.addEventListener('click', function(event){
        var self = event.target
        if(self.classList.contains('todo-delete')){
            var todoCell = self.parentElement
            var todo_id = todoCell.dataset.id
            apiTodoDelete(todo_id, function(r){
                log('删除成功', todo_id)
                todoCell.remove()
            })
        }
    })
}

var bindEventTodoEdit = function() {
    var todoList = e('.todo-list')
    todoList.addEventListener('click', function(event){
        var self = event.target
        if(self.classList.contains('todo-edit')){
            var todoCell = self.parentElement
            insertEditForm(todoCell)
        }
    })
}


var bindEventTodoUpdate = function() {
    var todoList = e('.todo-list')
    todoList.addEventListener('click', function(event){
        var self = event.target
        if(self.classList.contains('todo-update')){
            log('点击了 update ')
            var editForm = self.parentElement
            var input = editForm.querySelector('.todo-edit-input')
            var title = input.value
            var todoCell = self.closest('.todo-cell')
            var todo_id = todoCell.dataset.id
            var form = {
                'id': todo_id,
                'title': title,
            }
            apiTodoUpdate(form, function(r){
                log('更新成功', todo_id)
                var todo = JSON.parse(r)
                var selector = '#todo-' + todo.id
                var todoCell = e(selector)
                var titleSpan = todoCell.querySelector('.todo-title')
                titleSpan.innerHTML = todo.title
//                todoCell.remove()
            })
        }
    })
}

var bindEvents = function() {
    bindEventTodoAdd()
    bindEventTodoDelete()
    bindEventTodoEdit()
    bindEventTodoUpdate()
}

var __main = function() {
    bindEvents()
    loadTodos()
}

__main()
