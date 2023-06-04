import { accaunt } from "../index.js";
import { el, setChildren } from 'redom';
import { getUserCurrencyObjectArray, getUserChoicesItems, getBalanceString,  getCurrentTransactionArray } from "./data-utils.js";
import { loginErrorMessageObject, handledTransferError } from "./entity.js";
import { createCurrencyItem, userCurrencyChoices, createHistoryTableItem, createChangeCurrencyItem } from "./dom.js"
import { getTypedTransactionArray } from "./elements/transaction-data-util/index.js";
import { animator } from "chart.js";
import { transferFounds } from "./api.js";
import { refreshAutocompleteSelect } from "./elements/autocompliteSelect/index.js";


// II
// Ошищаем содержимое эжлемента
function clearContainer(contentContainer) {
  contentContainer.innerHTML = '';
}

// V/1
// Делаем активной нужную ссылку в навигации
function activeNavLink(linkSelector) {
  if (document.querySelector('.nav-link--active')) {
    document.querySelector('.nav-link--active').classList.remove('nav-link--active');
  }

  document.querySelector(linkSelector).classList.add('nav-link--active');
};

// IX
// Создаём спинер загрузки
function createLoadingSpiner(spinerClass='normal-spiner') {
  const spiner = el('div', {class: `${spinerClass} spiner`});
  return spiner;
};

// X
// Проводим валидацию инаутов входа
function validateLoginInput(input, alertMessageElement, alertClass) {
  const validateStatus = /\S{6,}/.test(input.value.trim());
  
  if (!validateStatus) {
    alertMessageElement.textContent = 'Поля должны содержать 6 символов и не cодержать пробелов';
    alertMessageElement.classList.remove('hidden');
    input.classList.add(alertClass);
  };
};

// XI
//Обрабатываем ошибку входа в аккаунта
function handledLoginError(errorMessage, alertMessageElement) {
  alertMessageElement.textContent = loginErrorMessageObject[errorMessage];
  alertMessageElement.classList.remove('hidden');
};

// XXXIIX
// Инициализируем обновление контента изменения куса валют
function initCurrencyChangeRefresh(currencyChangeBlock, currencyChangeContentSelector) {
  let currencySoket = new WebSocket('ws://localhost:3000/currency-feed');
  const contentContainer = document.querySelector(currencyChangeContentSelector);

  currencySoket.onmessage = (ev) => {
    contentContainer.prepend(createChangeCurrencyItem(ev.data));
    let changeCurrencyItems = document.querySelectorAll('.currency-change-item');
    if (changeCurrencyItems.length > 17) {
      changeCurrencyItems[changeCurrencyItems.length - 1].remove();
    };
  };
}

// LIV
// Обновляем контент блока Ваши валюты
function refreshUserCurrencyBlock(currencyContentSelector, userCurrency) {
  const userCurrencyObjectArray = getUserCurrencyObjectArray(userCurrency);
  const content = document.querySelector(currencyContentSelector);
  content.innerHTML = '';
  userCurrencyObjectArray.forEach((currencyObject) => {
    content.append(createCurrencyItem(currencyObject));
  });
}

// LIX
// Обрабатываем отправку формф нового перевода
function transferFormSubmit(event) {
  event.preventDefault(); 

  const recipientAccaunt = document.querySelector('.accaunt-select').value;
  const amount = document.querySelector('.acaunt-transfer-amount-input').value;
  const formButton = document.querySelector('.accaunt-transfer-button');
  const alertSpan = document.querySelector('.alert-span');


  if (recipientAccaunt && amount) {
    formButton.classList.add('loading');
    transferFounds(accaunt, recipientAccaunt, amount)
      .then((resp) => {
        if (resp.payload !== null) {          
          let recipientHistory = JSON.parse(window.localStorage.getItem('recipientHistory'));          
          if (!recipientHistory.find((el) => {return el === String(`${recipientAccaunt}`)})) {
            recipientHistory.push(String(recipientAccaunt));
            window.localStorage.setItem('recipientHistory', JSON.stringify(recipientHistory));
          }
          refreshAccauntPage(resp.payload);
        } else if (resp.payload === null) {
          alertSpan.classList.remove('hidden');
          alertSpan.textContent = handledTransferError['Wrong account'];
          document.querySelector('.accaunt-transfer-input').classList.add('input--alert');
          refreshAccauntPage(resp.payload);
        } else {
          alertSpan.classList.remove('hidden');
          alertSpan.textContent = handledTransferError[resp.error];
        }
      })
      .finally(() => {
        formButton.classList.remove('loading');
      }); 
  } else {
    [
      document.querySelector('.accaunt-select'),
      document.querySelector('.acaunt-transfer-amount-input')
    ].forEach((input) => {
      if (!input.value) {
        input.classList.add('input--alert')
      }
    });
    alertSpan.textContent = 'Заполните поля';
    alertSpan.classList.remove('hidden');
  }
}

// LXI
// Обновляем селект валют пользователя
function refreshUserCurrencyChoices(userCurrency) {
  const userChoicesItems = getUserChoicesItems(userCurrency);
  userCurrencyChoices.clearChoices();
  userCurrencyChoices.setChoices(userChoicesItems);
}

//LXII
// Обновляем страницу просмотра счёта
function refreshAccauntPage(accauntObject) {
  document.querySelector('.accaunt-balance-span').textContent = `${getBalanceString(accauntObject.balance)} ₽`;
  const transactionArray = getTypedTransactionArray(accauntObject.transactions);
  document.querySelector('.history-table-body').prepend(createHistoryTableItem(transactionArray.pop()));

  refreshAutocompleteSelect();

  const historyItems = document.querySelectorAll('.history-table-item');

  if (historyItems.length > 10) {
    historyItems[historyItems.length - 1].remove();
  }
}

// LXIIX
// Обрабатываем пагинацию назад таблицы истории переводов
function paginateBack(currentPagination, transactionArray, tableBody, targetButton, historyPageNumber) {
  if (targetButton.classList.contains('pagination-number')) {
    currentPagination.paginationNumber = Number(targetButton.textContent);
  } else {
    currentPagination.paginationNumber -= 1;
  }

  const currentTransactionArray = getCurrentTransactionArray(transactionArray, currentPagination.paginationNumber, 25);
  tableBody.innerHTML = '';
  currentTransactionArray.forEach((item) => {
    tableBody.prepend(createHistoryTableItem(item))
  });
  refreshPaginationButton(currentPagination, historyPageNumber);
}

// LXIX
// Обрабатываем пагинацию вперёд таблицы истории переводов
function paginateNext(currentPagination, transactionArray, tableBody, targetButton, historyPageNumber) {
  if (currentPagination.querySelector('.pagination-short-container')) {
    handledShortPaginate(currentPagination, transactionArray, tableBody, targetButton);
    return;
  }
  
  if (targetButton.classList.contains('pagination-number')) {
    currentPagination.paginationNumber = Number(targetButton.textContent);
  } else {
    currentPagination.paginationNumber += 1;
  }

  const currentTransactionArray = getCurrentTransactionArray(transactionArray, currentPagination.paginationNumber, 25);
  tableBody.innerHTML = '';
  currentTransactionArray.forEach((item) => {
    tableBody.prepend(createHistoryTableItem(item));
  });

  refreshPaginationButton(currentPagination, historyPageNumber);
}

// LXXI
// Обновляем классы и текст кнопок пагинации
function refreshPaginationButton(currentPagination, pagesNumber) {
  const currentPage = currentPagination.paginationNumber;
  const buttonBack = currentPagination.querySelector('.pagination-button');
  const activeButton = currentPagination.querySelector('.active-button');
  const buttonNext = currentPagination.querySelectorAll('.pagination-button')[currentPagination.querySelectorAll('.pagination-button').length - 1];
  const buttonNumberLeft = currentPagination.querySelector('.pagination-number-left');
  const buttonNumberMid = currentPagination.querySelector('.pagination-number-mid');
  const buttonNumberRight = currentPagination.querySelector('.pagination-number-right');

  [buttonNumberLeft, buttonNumberMid, buttonNumberRight].forEach((button) => {
    button.classList.remove('pagination-back');
    button.classList.remove('pagination-next');
    button.classList.remove('pagination-active');
  });

  if (currentPage === 1) {
    buttonNumberLeft.classList.add('pagination-active');
    buttonNumberMid.classList.add('pagination-next');
    buttonNumberRight.classList.add('pagination-next');
    buttonBack.classList.add('hidden');

    [buttonNumberLeft.textContent, buttonNumberMid.textContent, buttonNumberRight.textContent,] = [1, 2, 3];
  } else if (currentPage === pagesNumber - 1) {
    buttonNumberLeft.classList.add('pagination-back');
    buttonNumberMid.classList.add('pagination-back');
    buttonNumberRight.classList.add('pagination-active');
    buttonNext.classList.add('hidden');

    [buttonNumberLeft.textContent, buttonNumberMid.textContent, buttonNumberRight.textContent,] = [currentPage - 2, currentPage - 1, currentPage];
  } else {
    buttonNumberLeft.classList.add('pagination-back');
    buttonNumberMid.classList.add('pagination-active');
    buttonNumberRight.classList.add('pagination-next');

    [buttonNext, buttonBack].forEach((button) => {
      button.classList.remove('hidden');
    });

    [buttonNumberLeft.textContent, buttonNumberMid.textContent, buttonNumberRight.textContent,] = [currentPage - 1, currentPage, currentPage + 1];
  }
}

// LXXII
// Обрабатываем пагинацию короткой пагинации
function handledShortPaginate(currentPagination, transactionArray, tableBody, targeButton) {
  currentPagination.pageNumber = Number(targeButton.textContent);
  currentPagination.querySelector('.pagination-active').classList.remove('pagination-active');
  targeButton.classList.add('pagination-active');
  tableBody.innerHTML = '';
  const currentTransactionArray = getCurrentTransactionArray(transactionArray, currentPagination.pageNumber - 1, 25);
  currentTransactionArray.forEach((item) => {
    tableBody.prepend(createHistoryTableItem(item));
  });
}

//Получаем высоту карты банкоматов
function getMapHeight() {
  if (document.documentElement.clientWidth >= 728) {
    return '720'
  } else {
    return `${document.documentElement.clientWidth - 50}`
  }
}

export { 
  clearContainer, 
  activeNavLink, 
  createLoadingSpiner, 
  validateLoginInput, 
  handledLoginError, 
  initCurrencyChangeRefresh,
  refreshUserCurrencyBlock,
  refreshUserCurrencyChoices,
  transferFormSubmit,
  paginateBack,
  paginateNext,
  refreshPaginationButton,
  getMapHeight,
}
