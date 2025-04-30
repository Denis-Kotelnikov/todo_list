// Находим элементы на странице
const form = document.querySelector('#form'); // Получаем элемент формы для добавления задач
const taskInput = document.querySelector('#taskInput'); //Получаем поле ввода для новой задачи
const todoTasksList = document.querySelector('#todoTasksList'); // Получаем список активных задач
const doneTasksList = document.querySelector('#doneTasksList'); // Получаем список выполненных задач

// Создаем массив в котором будут все задачи
let tasks = [];

// Проверяем, есть ли в localStorage значение по ключу 'tasks' (не null и не undefined)
if (localStorage.getItem('tasks')) {
  // Пытаемся выполнить следующий блок кода, чтобы отловить возможные ошибки при парсинге JSON
  try {
    // Получаем строку из localStorage по ключу 'tasks' и преобразуем её из JSON в объект/массив
    const parsedTasks = JSON.parse(localStorage.getItem('tasks'));
    // Проверяем, что распарсенные данные действительно являются массивом
    if (Array.isArray(parsedTasks)) {
      tasks = parsedTasks; // Если это массив, присваиваем его переменной tasks
      // Для каждой задачи из массива вызываем функцию renderTask для отображения на странице
      tasks.forEach(function (task) {
        renderTask(task);
      });
      // Если распарсенные данные не массив (например, объект или что-то другое)
    } else {
      tasks = []; // Инициализируем tasks пустым массивом
      saveToLocalStorage(); // Сохраняем пустой массив обратно в localStorage, чтобы исправить некорректные данные
    }
    // Если при парсинге JSON возникла ошибка (например, повреждённый JSON)
  } catch (e) {
    // Выводим ошибку в консоль для отладки
    console.error('Ошибка при чтении задач из localStorage:', e);
    // Инициализируем tasks пустым массивом
    tasks = [];
    // Сохраняем пустой массив обратно в localStorage, чтобы очистить некорректные данные
    saveToLocalStorage();
  }
}

// Добавление задачи
form.addEventListener('submit', addTask); // Обработчик события для добавления новой задачи при отправке формы

// Удаление и редактирование задачи в списке активных задач
todoTasksList.addEventListener('click', handleTaskAction);
doneTasksList.addEventListener('click', (event) => { // Обработчик для списка выполненных задач
  if (event.target.dataset.action === 'delete') {
    deleteCompletedTask(event); // Удаляем задачу из списка выполненных, если нажата кнопка "удалить"
  }
});

// Функции:

// Добавление задачи
function addTask(event) {
  event.preventDefault(); // Предотвращаем перезагрузку страницы при отправке формы
  const taskText = taskInput.value.trim(); // Получаем текст задачи и убираем лишние пробелы

  // Проверяем, что текст не пустой
  if (!taskText) {
    alert('Пожалуйста, введите задачу.'); // Если пустой, выводим предупреждение
    return;
  }

  // Создаем новый объект задачи с уникальным id и статусом выполнения
  const newTask = {
    id: Date.now(),
    text: taskText,
    done: false,
  };

  tasks.push(newTask); // Добавляем новую задачу в массив задач
  saveToLocalStorage(); // Сохраняем обновленный массив задач в localStorage
  renderTask(newTask); // Отображаем новую задачу на странице

  taskInput.value = ""; // Очищаем поле ввода после добавления задачи
  taskInput.focus(); // Устанавливаем фокус обратно на поле ввода
}

// Обработчик действий с задачами (удаление, редактирование, завершение)
function handleTaskAction(event) {
  const action = event.target.dataset.action; // Получаем действие из атрибута data-action

  if (action === 'delete') {
    deleteTask(event);  // Если действие - удалить, вызываем функцию удаления задачи
  } else if (action === 'edit') {
    editTask(event);   // Если действие - редактировать, вызываем функцию редактирования задачи
  } else if (action === 'done') {
    markAsDone(event); // Если действие - завершить, вызываем функцию завершения задачи
  }
}

// Функция для удаления активной задачи
function deleteTask(event) {
  const parenNode = event.target.closest('.task-list__item'); // Находим родительский элемент задачи (li)
  const id = Number(parenNode.id); // Получаем id задачи

  const index = tasks.findIndex(task => task.id === id); // Находим индекс задачи в массиве по id

  if (index !== -1) {
    tasks.splice(index, 1); // Удаляем задачу из массива по индексу
    saveToLocalStorage(); // Сохраняем изменения в localStorage
    parenNode.remove(); // Удаляем элемент из DOM-дерева на странице
  }
}

// Функция для редактирования существующей задачи
function editTask(event) {
  const taskItem = event.target.closest('.task-list__item'); // Находим элемент задачи, на который кликнули
  const titleElement = taskItem.querySelector('.task-title'); // Получаем элемент заголовка задачи
  const inputElement = taskItem.querySelector('.edit-input'); // Получаем элемент ввода для редактирования
  const saveButton = taskItem.querySelector('.save-btn'); // Получаем кнопку сохранения

  titleElement.style.display = 'none'; // Скрываем заголовок задачи
  inputElement.style.display = 'block'; // Показываем элемент ввода
  saveButton.style.display = 'block'; // Показываем кнопку сохранения

  const buttons = taskItem.querySelectorAll('.task-item__buttons'); // Получаем все кнопки в элементе задачи

  // Скрываем все кнопки
  buttons.forEach(button => {
    button.style.display = 'none';
  });

  // Устанавливаем фокус на элемент ввода
  inputElement.focus();

  // Обработчик клика по кнопке сохранения
  saveButton.onclick = () => {
    // Проверяем, что введённый текст не пустой
    if (!inputElement.value.trim()) {
      alert('Пожалуйста, введите текст для редактирования.');
      return;
    }

    titleElement.textContent = inputElement.value; // Обновляем текст заголовка задачи новым значением из ввода
    titleElement.style.display = 'block'; // Показываем заголовок задачи снова
    inputElement.style.display = 'none'; // Скрываем элемент ввода и кнопку сохранения
    saveButton.style.display = 'none'; // Скрываем элемент ввода и кнопку сохранения

    // Показываем все кнопки снова
    buttons.forEach(button => {
      button.style.display = 'flex';
    });

    // Получаем ID задачи и находим её индекс в массиве задач
    const id = Number(taskItem.id);
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      // Обновляем текст задачи в массиве задач
      tasks[index].text = inputElement.value;
      saveToLocalStorage(); // Сохраняем изменения в localStorage
    }

    saveButton.onclick = null; // Убираем обработчик клика после сохранения
  };
}

// Функция для переключения статуса выполнения задачи между активным и выполненным состоянием.
function markAsDone(event) {
  const taskItem = event.target.closest('.task-list__item'); // Находим элемент задачи, на который кликнули
  const id = Number(taskItem.id); // Получаем ID задачи

  const taskIndex = tasks.findIndex(task => task.id === id); // Находим индекс задачи по ID

  if (taskIndex !== -1) {
    tasks[taskIndex].done = !tasks[taskIndex].done; // Переключаем статус выполнения

    saveToLocalStorage(); // Сохраняем изменения в localStorage

    // Перемещаем задачу между списками
    if (tasks[taskIndex].done) {
      doneTasksList.appendChild(taskItem); // Перемещаем задачу в список выполненных
      taskItem.classList.add('done-task'); // Добавляем класс для стиля
    } else {
      todoTasksList.appendChild(taskItem); // Перемещаем задачу обратно в список активных
      taskItem.classList.remove('done-task'); // Убираем класс для стиля
    }
  }
}

// Функция для удаления завершенной задачи из списка выполненных.
function deleteCompletedTask(event) {
  const taskItem = event.target.closest('.task-list__item'); // Находим элемент задачи, на который кликнули
  const id = Number(taskItem.id); // Получаем ID задачи

  const index = tasks.findIndex(task => task.id === id); // Находим индекс задачи по ID

  if (index !== -1) {
    tasks.splice(index, 1); // Удаляем задачу из массива
    saveToLocalStorage(); // Сохраняем изменения

    taskItem.remove(); // Удаляем элемент из DOM
  }
}

// Функция для сохранения массива задач в localStorage.
function saveToLocalStorage() {
  localStorage.setItem('tasks', JSON.stringify(tasks)); // Сохраняем массив задач как строку JSON в localStorage
}

function renderTask(task) {
  // Определяем CSS-класс для заголовка задачи в зависимости от её статуса (выполнена или нет)
  const cssClass = task.done ? 'task-title task-title--done' : 'task-title';

  // Создаём HTML-код для элемента задачи, включая все необходимые элементы и кнопки
  const taskHTML = `
      <li id="${task.id}" class="task-list__item">
            <span class="${cssClass} view-mode">${task.text}</span>
            <input type="text" class="edit-input" value="${task.text}" style="display: none;">
            <button type="button" class="save-btn" style="display: none;">Сохранить</button>
            <div class="task-item__buttons">
              <button type="button" data-action="edit" class="btn-action">
                <img class="btn-img" src="./img/pencil.svg" alt="edit" width="18" height="18">
              </button>
              <button type="button" data-action="done" class="btn-action">
                <img class="btn-img" src="./img/tick.svg" alt="Done" width="18" height="18">
              </button>
              <button type="button" data-action="delete" class="btn-action">
                <img class="btn-img" src="./img/cross.svg" alt="delete" width="18" height="18">
              </button>
            </div>
          </li>`;

  if (task.done) { // Если задача выполнена, добавляем её в список выполненных задач
    doneTasksList.insertAdjacentHTML('beforeend', taskHTML); // Вставляем HTML-код в конец списка выполненных задач
  } else { // Иначе добавляем её в список активных задач
    todoTasksList.insertAdjacentHTML('beforeend', taskHTML); // Вставляем HTML-код в конец списка активных задач
  }
}
