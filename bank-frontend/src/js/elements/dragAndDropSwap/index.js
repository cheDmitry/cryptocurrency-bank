// 1. Перемещаемым элементам элементам и/или их потомкам недопустьпо добавлять обработчики событий 'mouseup'
// 2. При добавлении передвигаемому элементу или его потумку обраотчик события 'click'
//    нужно внутри функции-обработчика добавить следующую конструкцию:
//    {
//     if (!getStopCllickStatus(Объект события)) {
//       Код, который выполняет обработчик событий
//     }
//    }
// 3. Перемещаемуму элементу недопустипо присваивать/изменять свойсвта (startX, startY, stopClickStatus)
// 4. Перестаёт работать, если пользовтель применил на странице передвочик яндексбраузера


//Инициируем процесс передвижения и замены элементов в контейнере
function initiateMoveAndSwap(movableContainerSelector, movableElementsSelector) {
  const movableContainer = document.querySelector(movableContainerSelector);
  const movableElements = movableContainer.querySelectorAll(movableElementsSelector);

  setMovableContainerStyle(movableContainer);

  movableElements.forEach((elem, pos) => {
    setMovableElementStyle(elem, pos);
    elem.movableContainer = movableContainer;
    elem.addEventListener('mousedown', moveStart);
    elem.addEventListener('mouseup', moveEnd)
  });
}

// Задаём стили для контейнера передвижения
function setMovableContainerStyle(movableContainer) {
  movableContainer.classList.add('js-move-container');
  movableContainer.style.display = 'flex';
}

//Задаём стили для элементов передвижения
function setMovableElementStyle(element, order) {
  element.style.order = order;
  element.style.position = 'relative';
  element.classList.add('js-move-element')
}

//Начинаем движение элемента
function moveStart(event) {
  event.preventDefault();

  const currentEl = event.currentTarget;
  const moveContainer = currentEl.closest('.js-move-container');

  currentEl.classList.remove('js-move-element');
  currentEl.classList.add('js-move-active');
  currentEl.style.zIndex = 1000;

  currentEl.startX = event.clientX;
  currentEl.startY = event.clientY;

  moveContainer.addEventListener('mousemove', moveElement);
  moveContainer.addEventListener('click', () => {
    currentEl.stopClickStatus = false;
  });
};

//Прекращаем движение элемента
function moveEnd(event) {
  const currentEl = event.currentTarget;
  const moveContainer = currentEl.closest('.js-move-container');
  
  moveContainer.removeEventListener('mousemove', moveElement);

  if (currentEl.style.top || currentEl.style.left) {
    currentEl.stopClickStatus = true;
    currentEl.addEventListener('click', preventClick);
  };

  currentEl.style.left = ''; 
  currentEl.style.top = ''; 
  currentEl.style.zIndex = ''; 

  const swapElement = document.elementFromPoint(event.clientX, event.clientY);
  const siblingStatus = Boolean(currentEl.movableContainer === swapElement.movableContainer);


  if (swapElement.closest('.js-move-element') && siblingStatus) {
    swapElements(currentEl, swapElement);
    currentEl.addEventListener('click', preventClick);
  };

  currentEl.classList.remove('js-move-active');
  currentEl.classList.add('js-move-element');
}

// Передвигаем элемент
function moveElement(event) {
  const elementForMove = event.currentTarget.querySelector('.js-move-active');
  elementForMove.style.left = event.clientX - elementForMove.startX + 'px';
  elementForMove.style.top = event.clientY - elementForMove.startY + 'px';
}

//Меняем элементы местами
function swapElements(firstElement, secondElement) {
  const [firstOrder, secondOrder] = [
    firstElement.style.order,
    secondElement.style.order,
  ];

  firstElement.style.order = secondOrder;
  secondElement.style.order = firstOrder;
};

// Предотвращаем событие по умолчаню нажатия на элемент
function preventClick(event) {
  event.preventDefault();
  event.currentTarget.removeEventListener('click', preventClick);
}

//Получаем значение свойства stopClickStatus, перемещаемого элемента
function getStopCllickStatus(event) {
  return event.target.closest('.js-move-element').stopClickStatus;
}

export { initiateMoveAndSwap }
