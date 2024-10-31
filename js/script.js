document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  const todos = [];
  const RENDER_EVENT = "render-todo";
  const SAVED_EVENT = "saved-todo";
  const STORAGE_KEY = "TODO_APPS";

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addTodo();
  });

  function addTodo() {
    const textTodo = document.getElementById("title").value;
    const timestamp = document.getElementById("date").value;

    const generatedID = generateId();
    const todoObject = generateTodoObject(
      generatedID,
      textTodo,
      timestamp,
      false
    );
    todos.push(todoObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function generateId() {
    return +new Date();
  }

  function generateTodoObject(id, task, timestamp, isCompleted) {
    return {
      id,
      task,
      timestamp,
      isCompleted,
    };
  }

  document.addEventListener(RENDER_EVENT, function () {
    const uncompletedTODOList = document.getElementById("todos");
    uncompletedTODOList.innerHTML = "";

    const completedTODOList = document.getElementById("completed-todos");
    completedTODOList.innerHTML = "";

    for (const todoItem of todos) {
      const todoElement = makeTodo(todoItem);
      if (!todoItem.isCompleted) uncompletedTODOList.append(todoElement);
      else completedTODOList.append(todoElement);
    }
  });

  function makeTodo(todoObject) {
    const textTitle = document.createElement("h2");
    textTitle.innerText = todoObject.task;

    const textTimestamp = document.createElement("p");
    textTimestamp.innerText = todoObject.timestamp;

    const textContainer = document.createElement("div");
    textContainer.classList.add("inner");
    textContainer.append(textTitle, textTimestamp);

    const container = document.createElement("div");
    container.classList.add("item", "shadow");
    container.append(textContainer);
    container.setAttribute("id", `todo-${todoObject.id}`);

    if (todoObject.isCompleted) {
      const undoButton = createButton("undo-button", "", function () {
        undoTaskFromCompleted(todoObject.id);
      });

      const trashButton = createButton("trash-button", "", function () {
        removeTaskFromCompleted(todoObject.id);
      });

      container.append(undoButton, trashButton);
    } else {
      const checkButton = createButton("check-button", "", function () {
        addTaskToCompleted(todoObject.id);
      });

      container.append(checkButton);
    }
    return container;
  }

  function createButton(className, text, clickHandler) {
    const button = document.createElement("button");
    button.classList.add(className);
    button.innerText = text;
    button.addEventListener("click", clickHandler);
    return button;
  }

  function removeTaskFromCompleted(todoId) {
    const todoTargetIndex = findTodoIndex(todoId);

    if (todoTargetIndex === -1) return;

    todos.splice(todoTargetIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function undoTaskFromCompleted(todoId) {
    const todoTarget = findTodo(todoId);

    if (todoTarget == null) return;

    todoTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function addTaskToCompleted(todoId) {
    const todoTarget = findTodo(todoId);

    if (todoTarget == null) return;

    todoTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function findTodoIndex(todoId) {
    for (const index in todos) {
      if (todos[index].id === todoId) {
        return index;
      }
    }

    return -1;
  }

  function findTodo(todoId) {
    for (const todoItem of todos) {
      if (todoItem.id === todoId) {
        return todoItem;
      }
    }
    return null;
  }

  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(todos);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
  }

  function isStorageExist() {
    if (typeof Storage === "undefined") {
      alert("Your browser does not support local storage");
      return false;
    }
    return true;
  }

  document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
  });

  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
      for (const todo of data) {
        todos.push(todo);
      }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
  }
});
