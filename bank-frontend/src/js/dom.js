import { el, setChildren } from 'redom';
import { router, accaunt } from '../index.js';
import { initiateMoveAndSwap } from './elements/dragAndDropSwap/index.js';
import { 
  createLoadingSpiner, 
  validateLoginInput, 
  handledLoginError, 
  initCurrencyChangeRefresh, 
  refreshUserCurrencyBlock,  
  refreshUserCurrencyChoices, 
  transferFormSubmit, 
  paginateBack, 
  paginateNext, 
  getMapHeight 
} from './dom-utils.js';
import { 
  getLoginToken, 
  getAccauntInfo, 
  getCurrency, 
  getBanks, 
  createNewAccaunt, 
  getAccaunts, 
  buyCurrency 
} from './api';
import { 
  sortAccautnsAray, 
  getCords, 
  getBalanceString, 
  getDateString, 
  getUserCurrencyObjectArray, 
  getUserChoicesItems, getAllChoicesItems, 
  getCurrentTransactionArray, 
  getCurrencyObject 
} from './data-utils.js';
import { initAutoCompliteSelect } from './elements/autocompliteSelect/index.js';
import { createStandartChart, createStackChart } from './elements/chart/index.js';
import { handledExchangeError } from "./entity.js";
import load from 'ymaps-loader';
import Choices from 'choices.js';

import {getTransactionHistoryLength, getTypedTransactionArray} from './elements/transaction-data-util/index.js';

let token = null
let userCurrencyChoices = null;
let allCurrencyChoices = null;

// I
//Создаём базовую разметку и локальные данные приложения
function initializingApp() {
  const appContainer = el('div', {class: 'app-container'});

  const header = el('header', {class: 'header'});
  const headerContainer = el('div', {class: 'header-container container'});
  const headerLink = el('a', {href: '/login', class: 'header-link'}, 'Coin.');
  headerContainer.append(headerLink);
  header.append(headerContainer);

  const main = el('main', {class: 'main'});
  const mainTitle = el('h1', {class: 'main-title'}, 'Банковские операции с криптовалютой');
  const contentContainer = el('div', {class: 'content-container container'});
  setChildren(main, [contentContainer, mainTitle]);

  setChildren(appContainer, [header, main]);

  document.body.append(appContainer);

  if (!window.localStorage.getItem('sortType')) {
    window.localStorage.setItem('sortType', 'number');
  }

  if (!window.localStorage.getItem('accauntsNumber')) {
    window.localStorage.setItem('accauntsNumber', '9');
  }

  if (!window.localStorage.getItem('recipientHistory')) {
    window.localStorage.setItem('recipientHistory', JSON.stringify([]));
  }
};

// III
//Создаём страницу входа в аккаунт
function createLoginContent(container) {
  const loginContainer = el('div', {class: 'login-container'});
  const loginTitle = el('h2', {class: 'login-title section-title'}, 'Вход в аккаунт');
  const loginForm = el('form', {class: 'login-form'});
  const loginAlertSpan = el('span', {class: 'login-alert-span alert-span hidden'})
  setChildren(loginContainer, [loginTitle, loginForm, loginAlertSpan]);

  const logGroup = el('div', {class: 'log-group login-input-group'});
  const logSpan = el('span', {class: 'log-span login-input-span'}, 'Логин');
  const logInput = el('input', {class: 'log-input login-input input', placeholder: 'Введите логин', type: 'text'});
  setChildren(logGroup, [logSpan, logInput]);

  const passwordGroup = el('div', {class: 'password-group login-input-group'});
  const passwordSpan = el('span', {class: 'password-span login-input-span'}, 'Пароль');
  const passwordInput = el('input', {class: 'password-input login-input input', placeholder: 'Введите пароль', type: 'password'});
  setChildren(passwordGroup, [passwordSpan, passwordInput]);

  const buttonGroup = el('div', {class: 'button-group'});
  const formButton = el('button', {class: 'login-form-button primary-button btn-reset'}, 'Войти');
  buttonGroup.append(formButton);
  formButton.append(createLoadingSpiner('login-spiner'));

  setChildren(loginForm, [logGroup, passwordGroup, buttonGroup]);

  [logInput, passwordInput].forEach((input) => {
    input.addEventListener('blur', (ev) => {
      validateLoginInput(ev.currentTarget, loginAlertSpan, 'input--alert');
    });

    input.addEventListener('input', (ev) => {
      ev.currentTarget.classList.remove('input--alert');
      loginAlertSpan.classList.add('hidden');
      loginAlertSpan.textContent = '';
    });
  });

  loginForm.addEventListener('submit', (ev) => {
    ev.preventDefault();

    [logInput, passwordInput].forEach((input) => {
      validateLoginInput(input, loginAlertSpan, 'input--alert');
    });

    if (!document.querySelector('.input--alert')) {
      formButton.classList.add('loading');
      
      try {
        getLoginToken(logInput.value, passwordInput.value)
        .then((respObject) => {
          if (respObject.payload) {
            token = respObject.payload.token;
            router.navigate('/accaunts');
          } else {
            handledLoginError(respObject.error, loginAlertSpan)
            formButton.classList.remove('loading')
          }
        });
      } catch(err) {
        formButton.classList.remove('loading')
        loginAlertSpan.classList.remove('hidden');
        loginAlertSpan.textContent = 'Ой!!! Что-то пошло не так ((( Мы уже активно работаем над решением';
      }


    }
  });

  container.append(loginContainer);
}

// IV
//Создаём навигацию
function createHeaderNav(headerContainer) {
  const headerNav = el('nav', {class: 'header-nav nav'});

  const atmsLink = el('a', {href: '#', class: 'js-link-atms nav-link'}, 'Банкоматы')
  atmsLink.dataset.target = 'atms';

  const accauntsLink = el('a', {href: '#', class: 'js-link-accaunts nav-link'}, 'Счета')
  accauntsLink.dataset.target = 'accaunts';

  const currencyLink = el('a', {href: '#', class: 'js-link-currency nav-link'}, 'Валюта')
  currencyLink.dataset.target = 'currency';

  const loginLink = el('a', {href: '#', class: 'js-link-login nav-link'}, 'Выход')
  loginLink.dataset.target = 'login';

  setChildren(headerNav, [atmsLink, accauntsLink, currencyLink, loginLink]);

  headerNav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', (ev) => {
      ev.preventDefault();

      router.navigate(`/${ev.currentTarget.dataset.target}`)
    })
  });

  headerContainer.append(headerNav);

  initiateMoveAndSwap('.header-nav', '.nav-link');
};

// V
// Создаём страницу счетов
function createAccauntsPage(contentContainer) {
  const accauntsBottom = el('div', {class: 'accaunts-bottom'});
  contentContainer.append(createAccauntsTop());
  contentContainer.append(accauntsBottom);
  createAccauntsBottom('.accaunts-bottom', token);
};

// VI
// Создаём страницу просмотра счёта
function createAccauntPage(contentContainer, accauntId) {
  createAccauntHeader(contentContainer);
  
  const accauntContent = el('div', {class: 'accaunt-content'});
  contentContainer.append(accauntContent);

  createAccauntSkeleton(accauntContent);

  getAccauntInfo(accauntId, token)
    .then((accauntObject) => {
      accauntContent.innerHTML = '';
      createAccauntContent(accauntContent, accauntObject.payload);
    });
};

// VII
// Создаём страницу истории баланса
function createAccauntHistoryPage(contentContainer, accauntId) {
  createHistoryHeader(contentContainer, accauntId);

  const historyContent = el('div', {class: 'history-content'});
  contentContainer.append(historyContent);

  createHistorySkeleton(historyContent);

  getAccauntInfo(accauntId, token)
    .then((accauntObject) => {
      historyContent.innerHTML = '';
      createHistoryContent(historyContent, accauntObject.payload);
    })
};

// IIX
// Создаём страницу с валютами
function createCurrencyPage(contentContainer) {
  const currencyTitle = el('h2', {class: 'currency-title section-title'}, 'Валютный обмен');
  const currencyContent = el('div', {class: 'currency-content'});

  contentContainer.append(currencyTitle);
  contentContainer.append(currencyContent);

  createCurrencySkeleton(currencyContent);

  getCurrency(token)
    .then(([userCurrencyObject, allCurrencyArray]) => {
      currencyContent.innerHTML = '';
      createCurrencyContent(currencyContent, userCurrencyObject, allCurrencyArray);
    })
};

// IIX/1
// Создаём страницу с банкоматами
function createAtmsPage(contentContainer) {
  const atmsTitle = el('h2', {class: 'atms-title section-title'}, 'Карта банкомата');
  contentContainer.prepend(atmsTitle);
  contentContainer.insertAdjacentHTML('beforeend', `<div id="map" class="skeleton" style="width: 100%; height: ${getMapHeight()}px;"></div>`);

  getBanks(token)
    .then((banksArray) => {
      document.body.querySelector('#map').classList.remove('skeleton');
      createAtmsMap('map', banksArray);
    });
};

// XI/1
// Создаём верхнюю часть страницы со счетами
function createAccauntsTop() {
  const accauntTop = el('div', {class: 'accaunt-top section-top'});
  const accauntsTitle = el('h2', {class: 'accaunts-title section-title'}, 'Ваши счета');
  const accauntsTopButton = el('a', {href: '#', class: 'accaunts-top-button primary-button'}, 'Создать новый счёт');

  accauntsTopButton.append(createLoadingSpiner('accaunts-top-button-spiner'));
  accauntsTopButton.addEventListener('click', (ev) => {
    ev.preventDefault();
    const tagretButton = ev.currentTarget;
    tagretButton.classList.add('loading');
    createNewAccaunt(token)
      .then(() => {
        createAccauntsBottom('.accaunts-bottom', token);
        tagretButton.classList.remove('loading');
      });
  });

  setChildren(accauntTop, [accauntsTitle, createSortSelect(), accauntsTopButton]);
  return accauntTop;
};

// XII
// Создаём содержимое нижне части страницы счетов
function createAccauntsBottom(accauntsBottomSelector, token) {
  const accauntsBottom = document.querySelector(accauntsBottomSelector);
  const accauntsNumber = Number(window.localStorage.getItem('accauntsNumber'));

  accauntsBottom.innerHTML = '';

  for (let i = accauntsNumber; i > 0; i--) {
    accauntsBottom.append(createAccauntsCardSkeleton());
  };

  getAccaunts(token)
    .then((accauntsArray) => {
      accauntsBottom.innerHTML = '';
      const sortType = window.localStorage.getItem('sortType');
      accauntsArray = accauntsArray.sort(sortAccautnsAray[sortType]);
      accauntsArray.forEach((accaunt) => {
        accauntsBottom.append(createAccauntCard(accaunt));
      });
      initiateMoveAndSwap('.accaunts-bottom', '.accaunts-card');
    })
    .then(() => {
      window.localStorage.setItem('accauntsNumber', `${document.querySelectorAll('.accaunts-card').length}`); 
    }) 
};

// XIII
// Создаём верхнюю часть страницы просмотра счёта
function createAccauntHeader(conentContainer) {
  const accauntHeader = el('div', {class: 'accaunt-header section-header'});
  const accauntTitle = el('h2', {class: 'accaunt-title section-title'}, 'Просмотр счёта');
  const accauntHeaderButton = el('a', {href: '#', class: 'accaunt-header-button back-button primary-button'}, 'Вернуться назад');

  accauntHeaderButton.addEventListener('click', (ev) => {
    ev.preventDefault();
    router.navigate('/accaunts');
  });

  setChildren(accauntHeader, [accauntTitle, accauntHeaderButton]);
  conentContainer.append(accauntHeader);
}

// XIV
// Создаём скелетон загрузки страницы просмотра счёта
function createAccauntSkeleton(accauntContentContainer) {
  const skeletonTop = createSkeletonTop();
  const skeletonMid = el('div', {class: 'accaunt-skeleton-mid accaunt-content-mid'});
  const skeletonBottom = createSkeletonBottom();

  const midLeft = el('div', {class: 'accaunt-content-mid-left'});
  const midRight = el('div', {class: 'accaunt-content-mid-right'});
  
  setChildren(skeletonMid, [midLeft, midRight]);

  setChildren(midLeft, [
    el('h3', {class: 'accaunt-transfer-title block-title'}, 'Новый перевод'),
    el('div', {class: 'accaunt-input-skeleton skeleton'}),
    el('div', {class: 'accaunt-input-skeleton skeleton'}),
    el('div', {class: 'accaunt-button-skeleton skeleton'}),
  ]);

  setChildren(midRight, [
    el('h3', {class: 'accaunt-dynamics-title block-title'}, 'Динамика баланса'),
    el('div', {class: 'accaunt-chart-skeleton skeleton'}),
  ]);

  [skeletonTop, skeletonMid, skeletonBottom].forEach((element) => {
    accauntContentContainer.append(element);
  });
};

// XVI
// Создаём контент страницы просмотра счёта
function createAccauntContent(accauntContentContainer, accauntObject) {
  const accauntTop = createAccauntTop(accauntObject.account, accauntObject.balance);
  const accauntMid = createAccauntMid('accaunt-select', 'accaunt-dynamics-chart-container');
  const accauntBottom = createAccauntBottom(accauntObject);

  [accauntTop, accauntMid, accauntBottom].forEach((element) => {
    accauntContentContainer.append(element);
  });

  initAutoCompliteSelect('.accaunt-select');
  createStandartChart('.accaunt-dynamics-chart-container', accauntObject, 6);
}

// XVII
// Создаём заголовок страницы истории баланса
function createHistoryHeader(contentContainer, accauntId) {
  const historyHeader = el('div', {class: 'history-header section-header'});
  const historyTitle = el('h2', {class: 'history-title section-title'}, 'История баланса');
  const historyHeaderButton = el('a', {href: '#', class: 'history-header-button back-button primary-button'}, 'Вернуться назад');
  setChildren(historyHeader, [historyTitle, historyHeaderButton]);

  historyHeaderButton.addEventListener('click', (ev) => {
    ev.preventDefault();
    router.navigate(`/accounts/${accauntId}`);
  });

  contentContainer.append(historyHeader);
}

// XVII/1
// Создаём скелетон страницы истории баланса
function createHistorySkeleton(historyContent) {
  const skeletonTop = createSkeletonTop();
  const skeletonDynamicChart = createHistoryChartSkeleton('Динамика баланса');
  const skeletonRatioChart = createHistoryChartSkeleton('Соотношение входящих и исходящих транзакций');
  const skeletonBottom = createSkeletonBottom();

  [skeletonTop, skeletonDynamicChart, skeletonRatioChart, skeletonBottom].forEach((element) => {
    historyContent.append(element);
  });
}

// XIIX
// Создаём контент страницы истории баланса
function createHistoryContent(historyContent, accauntObject) {
  const historyTop = createAccauntTop(accauntObject.account, accauntObject.balance);
  const historyDynamicChart = createHistoryChartBlock('history-dynamic-chart-container', 'Динамика баланса');
  const historyRotationChart = createHistoryChartBlock('history-ratio-chart-container', 'Соотношение входящих и исходящих транзакций', 'stak');
  const historyBottom = createHistoryBottom(accauntObject);

  [historyTop, historyDynamicChart, historyRotationChart, historyBottom].forEach((element) => {
    historyContent.append(element);
  });

  createStandartChart('.history-dynamic-chart-container', accauntObject, 12);
  createStackChart('.history-ratio-chart-container', accauntObject, 12);
}

// XIX
// Создаём скелетон страницы обмена валютный
function createCurrencySkeleton(currensyContent) {
  const currencySkeleton = el('div', {class: 'currency-content'})
  const currencyLeftSkeleton = el('div', {class: 'currency-left'});
  const yourCurrencySkeleton = createYourCurrencySkeleton(6);
  const exchangeCurencySkeleton = createExchangeCurencySkeleton();  
  setChildren(currencyLeftSkeleton, [yourCurrencySkeleton, exchangeCurencySkeleton]);
  const currencyChangeSkeleton = createCurrencyChangeSkeleton(12);

  setChildren(currencySkeleton, [currencyLeftSkeleton, currencyChangeSkeleton]);

  currensyContent.append(currencySkeleton);
}

// XX/1
// Создаём контент страницы валюты
function createCurrencyContent(currencyContent, userCurrencyObject, allCurrencyArray) {
  const currency = el('div', {class: 'currency-content'});
  const currencyLeft = el('div', {class: 'currency-left'});
  const yourCurrency = createYourCurrency(userCurrencyObject);
  const exchangeCurrency = createExchangeCurrency(userCurrencyObject, allCurrencyArray);
  setChildren(currencyLeft, [yourCurrency, exchangeCurrency]);
  const currencyChange = createCurrencyChange();

  setChildren(currency, [currencyLeft, currencyChange]);

  currencyContent.append(currency);

  initCurrencyChangeRefresh(currencyChange, '.currency-change-content');
}

// XXII
// Создаём карту банкоматов
function createAtmsMap(mapId, banksObjectArray) {
  load({apiKey: ''}).then(() => {
    ymaps.ready(init);

    function init() {
      var myMap = new ymaps.Map(`${mapId}`, {
        center: [55.76, 37.64],
        zoom: 10,
      });
      var coords = getCords(banksObjectArray);

      var myCollection = new ymaps.GeoObjectCollection({}, {
        preset: 'islands#blueIcon',
      });
    
      for (var i = 0; i < coords.length; i++) {
          myCollection.add(new ymaps.Placemark(coords[i]));
      }
      
      myMap.geoObjects.add(myCollection);
    }
  });
}

//XXIII
// Создаём сeлект сотрировки счетов
function createSortSelect(accauntsCardsContainerSelector = '.accaunts-bottom') {
  const sortSelect = el('div', {class: 'check-container'});
  const sortSelectButton = el('button', {class: 'check-button'}, 'Сортировка');
  const sortSelectDropdown = el('div', {class: 'check-bottom'});
  setChildren(sortSelect, [sortSelectButton, sortSelectDropdown]);

  setChildren(sortSelectDropdown, [
    createSortItem('check-checkbox', 'number', 'По номеру'),
    createSortItem('check-checkbox', 'balance', 'По балансу'),
    createSortItem('check-checkbox', 'date', 'По последней транзакции'),
  ]);

  const sortType = window.localStorage.getItem('sortType');
  sortSelectDropdown.querySelector(`#${sortType}`).checked = true;

  window.addEventListener('click', (e) => {
    if (!e._withinCheck) {
      document.querySelectorAll('.check-button').forEach((button) => {
        button.classList.remove('check-button--active');
      })
    }
  })

  sortSelect.addEventListener('click', (ev) => {
    ev._withinCheck = true
  })

  sortSelectButton.addEventListener('click', (ev) => {
    ev.currentTarget.classList.toggle('check-button--active');
  })

  sortSelectDropdown.querySelectorAll('.check-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('click', (ev) => {
      ev.currentTarget;
      if (!ev.currentTarget.checked) {
        ev.preventDefault();
      } else {
        ev.currentTarget.closest('.check-bottom').querySelectorAll('.check-checkbox').forEach((el) => {
          if (el !== ev.currentTarget) {
            el.checked = false;
          }
        })

        window.localStorage.setItem('sortType', ev.currentTarget.value);
        createAccauntsBottom(accauntsCardsContainerSelector, token);
      }
    })
  })

  return sortSelect;
}

// XXIV
// Создаём скелетон каточки счёта
function createAccauntsCardSkeleton() {
  const accauntsCardSkeleton = el('div', {class: 'accaunts-card'});
  const skeletonNumber = el('h3', {class: 'accaunts-card-number-skeleton accaunts-card-number skeleton'});
  const skeletonBalance = el('div', {class: 'accaunts-balance'});
  const skeletonBottom = el('div', {class: 'acaunts-card-bottom'});
  setChildren(accauntsCardSkeleton, [skeletonNumber, skeletonBalance, skeletonBottom]);

  setChildren(skeletonBalance, [
    el('div', {class: 'accaunt-card-balance-skeleton skeleton'}),
    el('div', {class: 'accaunt-balance-ruble'}, '₽'),
  ]);

  const skeletonBottomLeft = el('div', {class: 'accaunts-card-bottom-info'});
  const skeletonButton = el('div', {class: 'accaunts-card-button-skeleton skeleton'});
  setChildren(skeletonBottom, [skeletonBottomLeft, skeletonButton]);

  setChildren(skeletonBottomLeft, [
    el('div', {class: 'accaunts-card-paragraph'}, 'Последняя транзакция'),
    el('div', {class: 'accaunts-card-data-skeleton skeleton'}),
  ]);
  
  return accauntsCardSkeleton;
}

// XXV
// Создаём карточку счёта
function createAccauntCard(accauntObject) {
  const accauntCard = el('div', {class: 'accaunts-card'});
  const accauntNumber = el('div', {class: 'accaunts-card-number'}, accauntObject.account);
  const accauntBalance = el('div', {class: 'accaunts-card-balance'}, `${getBalanceString(accauntObject.balance)} ₽`);
  const accauntBottom = el('div', {class: 'accaunts-card-bottom'});
  setChildren(accauntCard, [accauntNumber, accauntBalance, accauntBottom]);

  const accauntBottomInfo = el('div', {class: 'accaunts-card-bottom-info'});
  const accauntButton = el('a', {href: '#', class: 'accaunts-card-button primary-button'}, 'Открыть')
  setChildren(accauntBottom, [accauntBottomInfo, accauntButton]);

  let transactionDateString = null;

  if (accauntObject.transactions[0]) {
    transactionDateString = getDateString(accauntObject.transactions[0].date);
  } else {
    transactionDateString = 'Нет транзакций'
  }

  setChildren(accauntBottomInfo, [
    el('p', {class: 'accaunts-card-paragraph'}, 'Последняя транзакция'),
    el('div', {class: 'accaunts-card-date'}, transactionDateString),
  ]);

  accauntButton.addEventListener('click', (ev) => {
    ev.preventDefault();
    router.navigate(`/accounts/${accauntObject.account}`);
  });

  return accauntCard;
}

// XXVI
// Создаём верхнюю часть контента просмотра счёта
function createAccauntTop(accauntNumber, balance) {
  const accauntTop = el('div', {class: 'accaunt-content-top'});
  const accauntTopLeft = el('div', {class: 'accaunt-number'}, `№ ${accauntNumber}`);
  const accauntTopRight = el('div', {class: 'accaunt-top-right'});
  setChildren(accauntTop, [accauntTopLeft, accauntTopRight]);
  
  setChildren(accauntTopRight, [
    el('span', {class: 'accaunt-top-span'}, 'Баланс'),
    el('span', {class: 'accaunt-balance-span'}, `${getBalanceString(balance)} ₽`)
  ])

  return accauntTop;
}

// XXIIIX
// Создаём середину контента страницы просмотра счёта
function createAccauntMid(accauntSelectClass, accauntChartContainerClass) {
  const accauntMid = el('div', {class: 'accaunt-content-mid'});
  setChildren(accauntMid, [
    createAccauntMidLeft(accauntSelectClass),
    createAccauntMidRight(accauntChartContainerClass, 'Динамика баланса'),
  ]);

  return accauntMid;
}

// XXIX 
// Создаём нижнюю часть контента страницы просмотра счёта
function createAccauntBottom(accauntObject) {
  const accauntBottom = el('div', {class: 'accaunt-content-bottom'});
  const tableBody = el('div', {class: 'accaunt-table-body history-table-body'});
  const tableContent = el('div', {class: 'accaunt-table-content'});

  setChildren(tableContent, [createHistoryTableHead(), tableBody]);

  let transactionArray = getTypedTransactionArray(accauntObject.transactions, accaunt);
  let transactionsLength = transactionArray.length;

  accauntBottom.addEventListener('click', () => {
    router.navigate(`/accaunts/history/${accaunt}`)
  });

  setChildren(accauntBottom, [
    el('h3', {class: 'accaunt-history-title block-title'}, 'История переводов'),
    tableContent,
  ]);

  if (transactionArray.length >= 10) {
    for (let i = 0; i < 10; i++) {

      tableBody.append(createHistoryTableItem(transactionArray[transactionsLength - 1 - i]));
    };
  } else {
    for (let i = 0; i < transactionArray.length; i++) {
      tableBody.append(createHistoryTableItem(transactionArray[transactionsLength - 1 - i]));
    };
  };

  return accauntBottom;
}

// XXX
// Создаём скелетон верхней части контента
function createSkeletonTop() {
  const skeletonTop = el('div', {class: 'accaunt-skeleton-top accaunt-content-top'});
  const topLeft = el('div', {class: 'accaunt-skeleton-top-left'});
  const topRight = el('div', {class: 'accaunt-skeleton-top-right'});
  setChildren(skeletonTop, [topLeft, topRight]);

  setChildren(topLeft, [
    el('span', '№'),
    el('div', {class: 'accaunt-number-skeleton skeleton'}),
  ]);

  setChildren(topRight, [
    el('span', {class: 'accaunt-top-span'}, 'Баланс'),
    el('div', {class: 'accaunt-balance-skeleton skeleton'})
  ]);

  return skeletonTop;
}

// XXXI
// Создаём скелетон блока графика страницы истории баланса
function createHistoryChartSkeleton(chartTitle) {
  const chartSkeleton = el('div', {class: 'history-chart-blok'});
  setChildren(chartSkeleton, [
    el('h3', {class: 'history-chart-title blok-title'}, chartTitle),
    el('div', {class: 'history-chart-skeleton skeleton'}),
  ]);

  return chartSkeleton;
}

// XXXIII /-1
// Создаём блок с таблицей страницы истории баланса
function createHistoryChartBlock(chartContainerClass, chartTitle, chartType = 'standart') {
  const chartBlock = el('div', {class: `${chartContainerClass} history-chart-blok`});
  const title = el('h3', {class: 'history-chart-title blok-title'}, chartTitle);
  const chartContent = el('div', {class: 'history-chart-content'});
  setChildren(chartBlock, [title, chartContent]);

  const chartContainer = el('div', {class: 'history-chart-container chart-container'});
  chartContainer.append(el('canvas', {class: 'chart'}));
  
  let chartCount = null;

  if (chartType === 'stak') {
    chartCount = el('div', {class: 'history-chart-count history-stak-count count'});
    setChildren(chartCount, [
      el('div', {class: 'history-count stak-count count-top count-number'}),
      el('div', {class: 'history-count stak-count count-mid count-number'}),
      el('div', {class: 'history-count stak-count count-bottom count-number'}, '0 ₽'),
    ]);
  } else {
    chartCount = el('div', {class: 'history-chart-count history-standart-count count'}, );
    setChildren(chartCount, [
      el('div', {class: 'history-count standart-count count-top count-number'}),
      el('div', {class: 'history-count standart-count count-bottom count-number'}, '0'),
    ]);
  };

  setChildren(chartContent, [chartContainer, chartCount]);
  return chartBlock;
}

// XXXIII
// Создаём скелеон нижней части контента
function createSkeletonBottom() {
  const skeletonBottom = el('div', {class: 'accaunt-skeleton-bottom accaunt-content-bottom'});
  setChildren(skeletonBottom, [
    el('h3', {class: 'accaunt-history-title bloсk-title'}, 'История переводов'),
    createHistoryTableHead(),
  ]);

  for (let i = 0; i < 10; i++) {
    skeletonBottom.append(el('div', {class: 'history-table-item-skeleton skeleton'}))
  }

  return skeletonBottom;
}

// XXXIII/1
// Создаём скелетон блока "Ваши валюты"
function createYourCurrencySkeleton(currencyNumber) {
  const yourCurrencySkeleton = el('div', {class: 'your-currency'});
  const title = el('h3', {class: 'your-currency-title blok-title'}, 'Ваши валюты');
  const content = el('div', {class: 'your-currency-content'});
  setChildren(yourCurrencySkeleton, [title, content]);

  for (let i = 0; i < currencyNumber; i++) {
    content.append(createYourCurrencyItemSkeleton());
  }

  return yourCurrencySkeleton;
}

// XXXIV
// Создаём скелетон блока "Обмен валюты"
function createExchangeCurencySkeleton() {
  const exchangeCurencySkeleton = el('div', {class: 'exchange-currency'});
  const title = el('h3', {class: 'exchange-currency-title blok-title'}, 'Обмен валюты');
  const content = el('div', {class: 'exchange-currency-content'});
  setChildren(exchangeCurencySkeleton, [title, content]);

  const contentLeft = el('div', {class: 'exchange-currency-content-left'});
  const exchangeButton = el('div', {class: 'exchange-currency-button-skeleton skeleton'});
  setChildren(content, [contentLeft, exchangeButton]);

  setChildren(contentLeft, [
    el('div', {class: 'exchange-currency-input-skeleton'}),
    el('div', {class: 'exchange-currency-input-skeleton'}),
  ]);

  return exchangeCurencySkeleton;
}

// XXXV
// Создаём скелетон блока изменение курса валют в ремльном времени
function createCurrencyChangeSkeleton(itemNumber) {
  const currencyChangeSkeleton = el('div', {class: 'currency-change'});
  const title = el('h3', {class: 'currency-change-title blok-title'}, 'Изменение курсов в реальном времени');
  const content = el('div', {class: 'currency-change-content'});
  setChildren(currencyChangeSkeleton, [title, content]);

  for (let i = 0; i < itemNumber; i++) {
    content.append(createYourCurrencyItemSkeleton());
  };

  return currencyChangeSkeleton;
}

// XXXVI
//Создаём блок с валютами пользователя
function createYourCurrency(userCurrency) {
  const userCurrensyObjectArray = getUserCurrencyObjectArray(userCurrency);

  const yourCurrency = el('div', {class: 'your-currency'});
  const title = el('h3', {class: 'your-currency-title bloсk-title'} , 'Ваши валюты');
  const content = el ('div', {class: 'your-currensy-content'});
  setChildren(yourCurrency, [title, content]);

  userCurrensyObjectArray.forEach((el) => {
    content.append(createCurrencyItem(el));
  });

  return yourCurrency;
}

// XXXVII 
// Создаём блок обмена валют
function createExchangeCurrency(userCurrency, allCurrency) {
  const exchangeCurrency = el('div', {class: 'exchange-currency'});
  const title = el('h3', {class: 'exchange-currency-title bloсk-title'}, 'Обмен валюты');
  const form = el('form', {class: 'exchange-currency-form'});
  const alertSpan = el('span', {class: 'exchange-currency-alert-span alert-span hidden'});
  setChildren(exchangeCurrency, [title, form, alertSpan]);

  const formLeft = el('div', {class: 'exchange-currency-form-left'});
  const formButton = el('button', {type: 'submit', class: 'exchange-currency-form-button primary-button'}, 'Обменять');
  setChildren(form, [formLeft, formButton]);

  formButton.append(createLoadingSpiner('exchenge-spiner'));

  const leftTop = el('div', {class: 'exchange-currency-form-left-top'});
  const leftBottom = el('div', {class: 'exchange-currency-form-left-bottom'});
  setChildren(formLeft, [leftTop, leftBottom]);



  const userCurrencySelectGroup = el('div', {class: 'user-currency-select-group exchange-currency-select-group'});
  const userCurrencySelect = el('select', {class: 'user-currency-select exchange-currency-select'});
  setChildren(userCurrencySelectGroup, [
    el('span', {class: 'exchange-currency-form-span'}, 'Из'),
    userCurrencySelect,
  ]);

  const allCurrencySelectGroup = el('div', {class: 'all-currency-select-group exchange-currency-select-group'});
  const allCurrencySelect = el('select', {class: 'all-currency-select exchange-currency-select'});
  setChildren(allCurrencySelectGroup, [
    el('span', {class: 'exchange-currency-form-span'}, 'в'),
    allCurrencySelect,
  ]);

  setChildren(leftTop, [userCurrencySelectGroup, allCurrencySelectGroup]);

  const amountInput = el('input', {type: 'number', min: '1', class: 'exchange-currency-amount-input input'});
  setChildren(leftBottom, [
    el('span', {class: 'exchange-currency-form-span'}, 'Сумма'),
    amountInput,
  ]);

  [userCurrencySelect, allCurrencySelect, amountInput].forEach((input) => {
    input.addEventListener('input', (e) => {
      alertSpan.classList.add('hidden');
      alertSpan.textContent = '';
      e.currentTarget.classList.remove('input--alert');
    })
  });

  form.addEventListener('submit', submitExchangeForm);

  const userChoicesItems = getUserChoicesItems(userCurrency);
  const allChoicesItems = getAllChoicesItems(allCurrency);

  userCurrencyChoices = new Choices(userCurrencySelect, {
    position: 'auto',
    choices: userChoicesItems,
    searchEnabled: false,
    itemSelectText: '',
  });

  allCurrencyChoices = new Choices(allCurrencySelect, {
    position: 'auto',
    choices: allChoicesItems,
    searchEnabled: false,
    itemSelectText: '',
  });

  return exchangeCurrency;
}

// XXXIIX
// Создаём блок изменения валют в реальном времени
function createCurrencyChange() {
  const currencyChange = el('div', {class: 'currency-change'});
  const title = el('h3', {class: 'currency-change-title bloсk-title'}, 'Изменение курсов в реальном времени');
  const content = el('div', {class: 'currency-change-content'});
  setChildren(currencyChange, [title, content]);

  return currencyChange;
}

// XL
// Создаём элемент выпадающего списка сортировки
function createSortItem(itemClass, itemValue, itemLabel) {
  const sortItem = el('div', {class: 'chekbox-label'});
  const sortInput = el('input', {type: 'checkbox', name: 'sort', value: itemValue, id: itemValue, class: itemClass});
  const sortInputLabel = el('label', {class: 'check-label', for: itemValue}, itemLabel);
  setChildren(sortItem, [sortInput, sortInputLabel])

  return sortItem;
}

// XLIII 
// Создаём блок новый перевод
function createAccauntMidLeft(selectClass) {
  const accauntMidLeft = el('div', {class: 'accaunt-content-mid-left'});
  const title = el('h3', {class: ' accaunt-transfer-title blok-title'}, 'Новый перевод');
  const form = el('form', {class: 'accaunt-transfer-form'});
  const alertSpan = el('span', {class: 'accaunt-transfer-alert-span alert-span hidden'});
  setChildren(accauntMidLeft, [title, form, alertSpan]);

  const numberInputGroup = el('div', {class: 'acaunt-transfer-number-group accaunt-transfer-input-group'});
  const amountInputGroup = el('div', {class: 'acaunt-transfer-amount-group accaunt-transfer-input-group'});
  const formButton = el('button', {type: 'submit', class: 'accaunt-transfer-button primary-button'}, 'Отправить');
  setChildren(form, [numberInputGroup, amountInputGroup, formButton]);

  formButton.append(createLoadingSpiner('transfer-spiner'));

  const numberInputLabel = el('span', {class: 'accaunt-transfer-input-label input-label'}, 'Номер счёта получателя');
  const numberInput = el('input', {type: 'number', class: `${selectClass} accaunt-transfer-input input`});
  setChildren(numberInputGroup, [numberInputLabel, numberInput]);

  const amountInputLabel = el('span', {class: 'accaunt-transfer-input-label input-label'}, 'Сумма перевода');
  const amountInput = el('input', {type: 'number', min: '1', value: '1' , class: `acaunt-transfer-amount-input accaunt-transfer-input input`});
  setChildren(amountInputGroup, [amountInputLabel, amountInput]);

  form.addEventListener('submit', transferFormSubmit);


  [numberInput, amountInput].forEach((input) => {
    input.addEventListener('keydown', (ev) => {      
      if (/\d|\.|Tab|Enter|Backspace/.test(String(ev.key))) {
        ev.currentTarget.classList.remove('input--alert');
        alertSpan.textContent = '';
        alertSpan.classList.add('hidden');
      } else {
        // ev.preventDefault();
      }
    });
  });

  return accauntMidLeft;
}

// XLIV
// Создаём блок с таблицей динамики баланса страницы просмотра счёта
function createAccauntMidRight(chartContainerClass, chartTitle) {
  const chartBlok = el('div', {class: `${chartContainerClass} accaunt-chart-blok accaunt-content-mid-right`});
  const title = el('h3', {class: 'accaunt-chart-title bloсk-title'}, chartTitle);
  const chartContent = el('div', {class: 'accaunt-chart-content'});
  setChildren(chartBlok, [title, chartContent]);

  const chartContainer = el('div', {class: 'accaunt-chart-container'});
  const chartCount = el('div', {class: 'accaunt-chart-count count'});
  setChildren(chartContent, [chartContainer, chartCount]);

  chartContainer.append(el('canvas', {class: 'chart'}));
  setChildren(chartCount, [
    el('div', {class: 'accaunt-count standart-count count-top count-number'}),
    el('div', {class: 'accaunt-count standart-count count-bottom count-number'}, '0'),
  ]);

  chartBlok.addEventListener('click', () => {
    router.navigate(`/accaunts/history/${accaunt}`)
  });

  return chartBlok;
}

// XLV 
// Создаём строку таблицы истории
function createHistoryTableItem(transactionObject) {
  const item = el('div', {class: 'history-table-item'});
  const fromElement = el('div', {class: 'history-table-item-from table-item table-item-from'}, transactionObject.from);
  const toElement = el('div', {class: 'history-table-item-to table-item table-item-to'}, transactionObject.to);
  let amountElement = null;

  if (transactionObject.type === 1) {
    amountElement = el('div', {class: 'history-table-item-receipts history-table-item-amount table-item table-item-amount'}, `+ ${getBalanceString(transactionObject.amount)}  ₽`);
  } else {
    amountElement = el('div', {class: 'history-table-item-expenses history-table-item-amount table-item table-item-amount'}, `- ${getBalanceString(transactionObject.amount)}  ₽`);
  }

  const transactionDate = new Date(transactionObject.date);
  const transactionDateString = `${transactionDate.getDate()}.${transactionDate.getMonth() < 10 ? '0' + (transactionDate.getMonth() + 1) : transactionDate.getMonth() + 1}.${transactionDate.getFullYear()}`;
  const dateElement = el('div', {class: 'history-table-item-date table-item table-item-date'}, transactionDateString);

  setChildren(item, [
    fromElement,
    toElement,
    amountElement,
    dateElement,
  ]);

  return item;
}

// XLVII
// Создаём скелето элемента валют
function createYourCurrencyItemSkeleton() {
  const itemSkeleton = el('div', {class: 'your-currency-item currency-item'});
  setChildren(itemSkeleton, [
    el('div', {class: 'currency-item-skeleton-left skeleton'}),
    el('div', {class: 'currency-item-skeleton-right skeleton'}),
  ]);

  return itemSkeleton;
}

// XLIIX/1
// Создаём элемент блока ваши валюты
function createCurrencyItem(currencyObject) {
  const currencyItem = el('div', {class: 'your-currency-item currency-item'});
  setChildren(currencyItem, [
    el('div', {class: 'your-currency-item-left'}, currencyObject.code),
    el('div', {class: 'your-currency-item-right'}, getBalanceString(currencyObject.amount)),
  ]);

  return currencyItem;
}

//XLIX
// Обрабатываем отправке формы обмена валют
function submitExchangeForm(event) {
  event.preventDefault();
  const targetForm = event.currentTarget;
  const alertSpan = targetForm.closest('.exchange-currency').querySelector('.alert-span');
  const formButton = targetForm.querySelector('.exchange-currency-form-button');
  const fromCurrency = targetForm.querySelector('.user-currency-select').value;
  const toCurrency = targetForm.querySelector('.all-currency-select').value;
  const amount = targetForm.querySelector('.exchange-currency-amount-input').value;

  if (amount < 1) {
    alertSpan.textContent = 'Укажите сумму перевода';
    alertSpan.classList.remove('hidden');
    targetForm.querySelector('.exchange-currency-amount-input').classList.add('input--alert');
    return;
  }

  formButton.classList.add('loading');

  buyCurrency(fromCurrency, toCurrency, amount, token)
    .then((resp) => {
      if (resp.payload) {
        refreshUserCurrencyBlock('.your-currensy-content', resp.payload);
        refreshUserCurrencyChoices(resp.payload);
      } else {
        alertSpan.classList.remove('hidden');
        alertSpan.textContent = handledExchangeError[resp.error];
      }
    })
    .finally(() => {
      formButton.classList.remove('loading');
    })    
}

// LXIII
// Создаём нижнюю часть страницы истории баланса
function createHistoryBottom(accauntObject) {
  const transactionArray = getTypedTransactionArray(accauntObject.transactions);
  const historyBottom = el('div', {class: 'accaunt-content-bottom'});
  const tableBody = el('div', {class: 'history-table-body'});
  const tableContent = el('div', {class: 'accaunt-table-content'});

  setChildren(tableContent, [createHistoryTableHead(), tableBody]);

  setChildren(historyBottom, [
    el('h3', {class: 'accaunt-history-title'}, 'История переводов'),
    tableContent,
  ]);



  if (transactionArray.length > 25) {
    historyBottom.append(createHistoryPagination(tableBody, transactionArray));
    const itemsArray = transactionArray.slice(transactionArray.length - 25, transactionArray.length);
    itemsArray.forEach((item) => {
      tableBody.prepend(createHistoryTableItem(item));
    })
  } else {
    transactionArray.forEach((item) => {
      tableBody.append(createHistoryTableItem(item));
    })
  }
  return historyBottom;
}

// LXIV
//Создаём головку таблицы истории баланса
function createHistoryTableHead() {
  const tableHead = el('div', {class: 'history-table-head'});
  setChildren(tableHead, [
    el('div', {class: 'history-table-head-item-from history-table-head-item table-item-from'}, 'Счёт отправителя'),
    el('div', {class: 'history-table-head-item-to history-table-head-item table-item-to'}, 'Счёт получателя'),
    el('div', {class: 'history-table-head-item-amount history-table-head-item table-item-amount'}, 'Сумма'),
    el('div', {class: 'history-table-head-item-date history-table-head-item table-item-date'}, 'Дата'),
  ]);

  return tableHead;
}

// LXV 
// Создаём пагинацию таблицы истории переводов 
function createHistoryPagination(tableBody, transactionArray) {
  const historyPagesNumber = Math.round(transactionArray.length / 25);
  const pagination = el('div', {class: 'history-table-pagination'});
  pagination.paginationNumber = 1;

  if (historyPagesNumber <= 3) {
    pagination.append(createShortPagination(historyPagesNumber));
  } else {
    pagination.append(createLongPagination());
  };

  pagination.addEventListener('click', (ev) => {
    const currentTarget = ev.currentTarget;
    let target = ev.target;

    if (target.classList.contains('pagination-active')) {
      ev.preventDefault();
    } else if (target.classList.contains('pagination-back')) {
      paginateBack(currentTarget, transactionArray, tableBody, target, historyPagesNumber);
    } else if (target.classList.contains('pagination-next')) {
      paginateNext(currentTarget, transactionArray, tableBody, target, historyPagesNumber);
    }
  })

  return pagination;
}

// LXVI
// Создаём короткую пагинацию 
function createShortPagination(historyPageNumber) {
  const pagination = el('div', {class: 'pagination-short-container pagination-container'});
  setChildren(pagination, [
    el('button', {class: 'pagination-active pagination-number pagination-next pagination-button'}, '1'),
    el('button', {class: 'pagination-number pagination-next pagination-button'}, '2'),
  ]);

  if (historyPageNumber = 3) {
    pagination.append(el('button', {class: 'pagination-number pagination-next pagination-button'}, '3'),)
  }

  return pagination;
}

// LXVII
// Создаём длинную паинацию
function createLongPagination() {
  const pagination = el('div', {class: 'pagination-long-container pagination-container'});
  setChildren(pagination, [
    el('button', {class: 'pagination-back pagination-button hidden'}, '<'),
    el('button', {class: 'pagination-active pagination-number-left pagination-number pagination-button'}, '1'),
    el('button', {class: 'pagination-number-mid pagination-number pagination-next pagination-button'}, '2'),
    el('button', {class: 'pagination-number-right pagination-number pagination-next pagination-button'}, '3'),
    el('button', {class: 'pagination-next pagination-button'}, '>'),
  ])

  return pagination;
}

// LXXII
// Создаём элемент с изменением курса валют
function createChangeCurrencyItem(currencyChangeData) {
  const currencyObject = getCurrencyObject(currencyChangeData);
  const changeItem = el('div', {class: 'currency-change-item'});
  const itemLeft = el('div',{class: 'currency-change-item-left your-currency-item-left'}, `${currencyObject.from}/${currencyObject.to}`);
  const itemRight = el('div',{class: 'currency-change-item-right your-currency-item-right'}, `${currencyObject.rate}`);
  setChildren(changeItem, [itemLeft, itemRight]);
  if (currencyObject.change > 0) {
    changeItem.classList.add('growing');
  } else {
    changeItem.classList.add('falling');
  }

  return changeItem;
}

//Обнуляем токен
function clearToken() {
  token = null;
}

export {
  token,
  initializingApp, 
  createLoginContent, 
  createHeaderNav, 
  createAccauntsPage, 
  createAccauntPage, 
  createAccauntHistoryPage, 
  createCurrencyPage, 
  createAtmsPage,
  createCurrencyItem,
  userCurrencyChoices,
  createHistoryTableItem,
  createChangeCurrencyItem,
  clearToken,
}


