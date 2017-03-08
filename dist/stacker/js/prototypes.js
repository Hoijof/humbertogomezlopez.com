
function createDiv (text, className) {
	var div = document.createElement('div');
	div.innerHTML = text;
	div.style.float = "right";
	div.style.cursor = "pointer";
	div.style.width = "16px";
	div.style.textAlign = "center";

	if (className !== undefined) {
		div.className = className;
	}

	return div;
}
// PROTOTYPES

/*
 * Returns the size of an array
*/
Array.prototype.size = function(){ 
	return this.filter(function(a){return a !== undefined;}).length
};

/*
 * Returns the size of an object
*/
Object.size = function(obj) {
    var size = 0, key = "";

    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


function TodoManager() {
	this.todos = [];
}

TodoManager.prototype.addTodo = function(todo) {
	this.todos.push(todo);
	todo.id = this.todos.length - 1;

	return todo;
};

TodoManager.prototype.removeTodo = function(id) {
	this.todos[id].derender();
	this.todos[id] = undefined;
}

TodoManager.prototype.redrawTodo = function(todoId, x, y) {
	var todo = this.todos[todoId];
	todo.x = x;
	todo.y = y;

	todo.derender();
	todo.render();
};

TodoManager.prototype.saveTodos = function() {
	if(typeof(Storage) !== "undefined") {
    	localStorage.setItem("todos", JSON.stringify(this.todos));
	} else {
	    console.log("you don't have local storage :(");
	}
};

TodoManager.prototype.loadTodos = function() {
	var i;

	this.todos = JSON.parse(localStorage.getItem("todos"));
	if (this.todos == null) this.todos = [];

	this.clearArray();
};

TodoManager.prototype.clearArray = function() {
	var i;

	this.todos = this.todos.filter(function(elem){return elem !== undefined && elem !== null});
	for (i in this.todos) {
		if (this.todos.hasOwnProperty(i)) {
			this.todos[i].id = i;
		}
	}
};

TodoManager.prototype.renderAllTodos = function() {
	this.todos.forEach(function(todo) {
		todo.__proto__ = Todo.prototype;
		todo.render();
	})
};

function Todo(name) {
	this.id = -1;
	this.name = name;
	this.depth = 100;
	this.x = 100;
	this.y = 100;
	this.color = '#'+Math.floor(Math.random()*16777215).toString(16);
}

Todo.prototype.render = function() {
	var node = document.createElement('div'),
		text = document.createElement('div'),
		that = this;

 	text.innerHTML = this.name
 	text.className = "cardText";
 	
	node.id = "todo_" + this.id;
	node.className = "card card-1";
	node.style.position = "fixed";
	node.style.left = this.x;
	node.style.top = this.y;
	node.style.cursor = "-webkit-grab";
	node.style.zIndex = this.depth;

	document.getElementById("mainContainer").appendChild(node);

	node.appendChild(createDiv('x', "controll"));
	node.appendChild(createDiv('-', "controll"));
	node.appendChild(createDiv('+', "controll"));
	node.appendChild(createDiv(this.depth, "depth"));

	node.appendChild(text);

	$("#todo_" + this.id).draggable({
		stop: function() {
			var todo = $("#todo_" + that.id)
			that.x = todo.css("left");
			that.y = todo.css("top");

			todoManager.saveTodos();
		}
	});
};

Todo.prototype.derender = function() {
	var node = document.getElementById("todo_" + this.id);
	document.getElementById("mainContainer").removeChild(node);
};