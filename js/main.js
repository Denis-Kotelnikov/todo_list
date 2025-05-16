// Находим элемент формы для добавления задач по id 'form'
const form = document.querySelector('#form');
// Находим поле ввода для новой задачи по id 'taskInput'
const taskInput = document.querySelector('#taskInput');
// Находим список активных задач по id 'todoTasksList'
const todoTasksList = document.querySelector('#todoTasksList');
// Находим список выполненных задач по id 'doneTasksList'
const doneTasksList = document.querySelector('#doneTasksList');

// Создаем массив для хранения задач
let tasks = [];

// Проверяем, есть ли в localStorage сохраненные задачи под ключом 'tasks'
if (localStorage.getItem('tasks')) {
  try {
    // Пытаемся распарсить JSON строку из localStorage
    const parsedTasks = JSON.parse(localStorage.getItem('tasks'));
    // Проверяем, что распарсенные данные — массив
    if (Array.isArray(parsedTasks)) {
      tasks = parsedTasks; // присваиваем массив задач
      // Отрисовываем каждую задачу на странице
      tasks.forEach(task => renderTask(task));
    } else {
      // Если данные не массив — очищаем массив задач и сохраняем
      tasks = [];
      saveToLocalStorage();
    }
  } catch (e) {
    // Обработка ошибок при парсинге JSON
    console.error('Ошибка при чтении задач из localStorage:', e);
    tasks = [];
    saveToLocalStorage();
  }
}

// Добавляем обработчик события 'submit' формы для добавления новой задачи
form.addEventListener('submit', addTask);

// Обрабатываем клики по активным задачам
todoTasksList.addEventListener('click', handleTaskAction);

// Обрабатываем клики по выполненным задачам
doneTasksList.addEventListener('click', (event) => {
  // Если клик по кнопке с data-action="delete" — удаляем задачу
  if (event.target.dataset.action === 'delete') {
    deleteCompletedTask(event);
  }
});

// Функция добавления новой задачи
function addTask(event) {
  event.preventDefault(); // предотвращаем перезагрузку страницы
  const taskText = taskInput.value.trim(); // получаем и очищаем введенный текст
  if (!taskText) {
    alert('Пожалуйста, введите задачу.'); // предупреждение, если поле пустое
    return;
  }
  // Создаем объект задачи с уникальным id, текстом и статусом
  const newTask = {
    id: Date.now(), // уникальный id по времени
    text: taskText,
    done: false,
  };
  tasks.push(newTask); // добавляем новую задачу в массив
  saveToLocalStorage(); // сохраняем в localStorage
  renderTask(newTask); // отображаем задачу на странице
  taskInput.value = ''; // очищаем поле ввода
  taskInput.focus(); // ставим фокус обратно в поле
}

// Обработка действий по задачам (удаление, редактирование, отметка выполнено)
function handleTaskAction(event) {
  const action = event.target.dataset.action; // получаем действие из data-action
  if (action === 'delete') {
    deleteTask(event); // удалить задачу
  } else if (action === 'edit') {
    editTask(event); // редактировать задачу
  } else if (action === 'done') {
    markAsDone(event); // отметить как выполненную
  }
}

// Удаление активной задачи
function deleteTask(event) {
  const taskItem = event.target.closest('.task-list__item'); // находим родительский элемент задачи
  const id = Number(taskItem.id); // получаем id задачи
  const index = tasks.findIndex(task => task.id === id); // ищем индекс задачи в массиве
  if (index !== -1) {
    tasks.splice(index, 1); // удаляем задачу из массива
    saveToLocalStorage(); // сохраняем изменения
    taskItem.remove(); // удаляем элемент из DOM
  }
}

// Удаление выполненной задачи
function deleteCompletedTask(event) {
  const taskItem = event.target.closest('.task-list__item'); // ищем родительский элемент
  const id = Number(taskItem.id); // получаем id
  const index = tasks.findIndex(task => task.id === id); // ищем индекс
  if (index !== -1) {
    tasks.splice(index, 1); // удаляем из массива
    saveToLocalStorage(); // сохраняем
    taskItem.remove(); // удаляем из DOM
  }
}

// Редактирование задачи
function editTask(event) {
  const taskItem = event.target.closest('.task-list__item'); // родительский элемент
  const titleElement = taskItem.querySelector('.task-title'); // отображаемое название задачи
  const inputElement = taskItem.querySelector('.edit-input'); // поле ввода для редактирования
  const saveButton = taskItem.querySelector('.save-btn'); // кнопка сохранить
  const buttons = taskItem.querySelectorAll('.task-item__buttons'); // все кнопки задачи

  // Скрываем отображение текста и показываем поле редактирования
  titleElement.style.display = 'none';
  inputElement.style.display = 'block';
  saveButton.style.display = 'block';

  // Скрываем все кнопки (редактировать, завершить)
  buttons.forEach(b => b.style.display = 'none');

  // Устанавливаем фокус в поле редактирования
  inputElement.focus();

  // Обработчик на кнопку "сохранить"
  saveButton.onclick = () => {
    const newText = inputElement.value.trim(); // получаем новый текст
    if (!newText) {
      alert('Пожалуйста, введите текст для редактирования.');
      return;
    }
    // Обновляем отображаемый текст
    titleElement.textContent = newText;
    // Возвращаем видимость текста и скрываем поле редактирования
    titleElement.style.display = 'block';
    inputElement.style.display = 'none';
    saveButton.style.display = 'none';

    // Показываем все кнопки обратно
    buttons.forEach(b => b.style.display = 'flex');

    // Обновляем текст задачи в массиве
    const id = Number(taskItem.id);
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index].text = newText; // меняем в массиве
      saveToLocalStorage(); // сохраняем
    }

    // Удаляем обработчик, чтобы не накапливался
    saveButton.onclick = null;
  };
}

// Переключение статуса задачи между активной и выполненной
function markAsDone(event) {
  const taskItem = event.target.closest('.task-list__item'); // родительский элемент
  const id = Number(taskItem.id); // id задачи
  const index = tasks.findIndex(task => task.id === id); // индекс в массиве
  if (index !== -1) {
    // Переключаем статус
    tasks[index].done = !tasks[index].done;
    saveToLocalStorage(); // сохраняем

    if (tasks[index].done) {
      // Перемещаем задачу в список выполненных
      doneTasksList.appendChild(taskItem);
      taskItem.classList.add('done-task');

      // Скрываем кнопки редактирования и завершения
      const buttonsContainer = taskItem.querySelector('.task-item__buttons');
      if (buttonsContainer) {
        const editBtn = buttonsContainer.querySelector('[data-action="edit"]');
        const doneBtn = buttonsContainer.querySelector('[data-action="done"]');
        if (editBtn) editBtn.style.display = 'none';
        if (doneBtn) doneBtn.style.display = 'none';
      }
    } else {
      // Возвращаем в активный список
      todoTasksList.appendChild(taskItem);
      taskItem.classList.remove('done-task');

      // Показываем кнопки снова
      const buttonsContainer = taskItem.querySelector('.task-item__buttons');
      if (buttonsContainer) {
        const editBtn = buttonsContainer.querySelector('[data-action="edit"]');
        const doneBtn = buttonsContainer.querySelector('[data-action="done"]');
        if (editBtn) editBtn.style.display = '';
        if (doneBtn) doneBtn.style.display = '';
      }
    }
  }
}

// Функция для отрисовки задачи на странице
function renderTask(task) {
  // Определяем CSS класс для текста задачи в зависимости от её статуса
  const cssClass = task.done ? 'task-title task-title--done' : 'task-title';

  // Создаем HTML блок задачи
  const taskHTML = `
    <li id="${task.id}" class="task-list__item">
      <span class="${cssClass} view-mode">${task.text}</span>
      <input type="text" class="edit-input" value="${task.text}" style="display: none;">
      <button type="button" class="save-btn" style="display: none;">Сохранить</button>
      <div class="task-item__buttons">
        <button type="button" data-action="edit" class="btn-action btn-done">
          <img class="btn-img" src="./img/pencil.svg" alt="edit" width="18" height="18">
        </button>
        <button type="button" data-action="done" class="btn-action btn-done">
          <img class="btn-img" src="./img/tick.svg" alt="Done" width="18" height="18">
        </button>
        <button type="button" data-action="delete" class="btn-action">
          <img class="btn-img" src="./img/cross.svg" alt="delete" width="18" height="18">
        </button>
      </div>
    </li>`;

  // В случае выполненной задачи — вставляем в список выполненных и скрываем кнопки редактирования/завершения
  if (task.done) {
    doneTasksList.insertAdjacentHTML('beforeend', taskHTML);
    const insertedElement = document.getElementById(task.id);
    if (insertedElement) {
      const buttonsContainer = insertedElement.querySelector('.task-item__buttons');
      if (buttonsContainer) {
        const editBtn = buttonsContainer.querySelector('[data-action="edit"]');
        const doneBtn = buttonsContainer.querySelector('[data-action="done"]');
        if (editBtn) editBtn.style.display = 'none';
        if (doneBtn) doneBtn.style.display = 'none';
      }
    }
  } else {
    // В остальных случаях — вставляем в активный список
    todoTasksList.insertAdjacentHTML('beforeend', taskHTML);
  }
}

// Функция сохранения массива задач в localStorage
function saveToLocalStorage() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}
