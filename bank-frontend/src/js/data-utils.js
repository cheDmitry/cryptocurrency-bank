import { cardsMonthsArray } from "./entity.js";


// XXV/1
// Объект с функциями сортировки массива с данными счетов
const sortAccautnsAray = {
  'number': function(firstItem, secondItem) {
    return firstItem.account - secondItem.account; 
  },
  'balance': function(firstItem, secondItem) {
    return firstItem.balance - secondItem.balance; 
  },
  'date': function(firstItem, secondItem) {
    let isTrabsactionsFirstItme = null;
    let isTrabsactionsSecondItme = null;

    if (firstItem.transactions.length > 0) {
      isTrabsactionsFirstItme = 1;
    } else {
      isTrabsactionsFirstItme = 0;
    }

    if (secondItem.transactions.length > 0) {
      isTrabsactionsSecondItme = 1;
    } else {
      isTrabsactionsSecondItme = 0;
    }

    if (isTrabsactionsFirstItme && isTrabsactionsSecondItme) {
      return new Date(firstItem.transactions[0].date) - new Date(secondItem.transactions[0].date); 
    } else {
      return isTrabsactionsFirstItme - isTrabsactionsSecondItme
    }    
  },
}

// XXXIX
// Получаем масств координатов банкоматов
function getCords(banksObjectArray) {
  let corordsArray = [];
  banksObjectArray.forEach((el) => {
    corordsArray.push([el.lat, el.lon])
  })

  return corordsArray;
}

// XLI
// Получаем строку с цифрой баланса
function getBalanceString(balance) {
  let n = 0;
  let numberLength = String(balance).length;
  let integralPart = Math.floor(balance);
  let originBalanceString = String(integralPart);
  let originSymbolArray = originBalanceString.split('').reverse();
  let newSymbolArray = [];
  let fractionalLenght = numberLength - originBalanceString.length - 1;
  let fractionalPart = Math.abs(Math.floor(balance % 1 * (10 ** 2)));

  if (fractionalPart === 0) {
    fractionalPart = '00';
  }

  originSymbolArray.forEach((elem) => {
    if (n === 3) {
      newSymbolArray.unshift(' ');
      newSymbolArray.unshift(elem);
      n = 1;
    } else {
      newSymbolArray.unshift(elem);
      n += 1;
    }
  })

  let balanceString = newSymbolArray.join('');
  balanceString += `.${fractionalPart}`;
  return balanceString;
}

//XLII
// Возвращаем строку с датой последней транзакции для карточки счёта
function getDateString(date) {
  const dateObject = new Date(date);
  const day = dateObject.getDate();
  const month = cardsMonthsArray[dateObject.getMonth()];
  const year = dateObject.getFullYear();
  const dateString = `${day} ${month} ${year}`;
  return dateString
}

// XLIIX
// Получаем массив  с объектами валют пользователся
function getUserCurrencyObjectArray(userCurrency) {
  let currrencyObjectArray = [];
  const currencyKeys = Object.keys(userCurrency);
  currencyKeys.forEach((currency) => {
    const currencyObject = {
      amount: userCurrency[currency].amount,
      code: userCurrency[currency].code
    }

    currrencyObjectArray.push(currencyObject);
  });

  return currrencyObjectArray;
}

// L
// Получаем данные для кстомного селекта валют пользователя
function getUserChoicesItems(userCurrency) {
  const userCurrencyObjectArray = getUserCurrencyObjectArray(userCurrency);
  let userChoicesItems = [];
  userCurrencyObjectArray.forEach((currency, index) => {
    userChoicesItems.push(getChoicesItem(currency.code, index))
  })

  return userChoicesItems;
}

// LI
// Получаем данные для кастомного селекта всех валют
function getAllChoicesItems(allCurrencyArray) {
  let allChoicesItems = [];
  allCurrencyArray.forEach((currency, index) => {
    allChoicesItems.push(getChoicesItem(currency, index))
  })

  return allChoicesItems;
}

// LVII
// Создаём элемент для кастомного селекта
function getChoicesItem(currencyCode, index) {
  let choicesItem = {
    value: currencyCode,
    label: currencyCode,
  };

  if (index === 0) {
    choicesItem.selected = true;
  } else {
    choicesItem.selected = false;
  }

  return choicesItem;
}

// LXX
// Получаем массив транзакций для нужной страницы массива
function getCurrentTransactionArray(transactionArray, pageNumber, itemsOnPage) {
  const remains = transactionArray.length - (pageNumber * itemsOnPage);
  let currentTransactionArray = null;
  
  if (remains > itemsOnPage && pageNumber !== 0) {
    currentTransactionArray = transactionArray.slice(transactionArray.length - itemsOnPage * pageNumber, (transactionArray.length - itemsOnPage * pageNumber) + itemsOnPage);  
  } else if (pageNumber === 0) {
    currentTransactionArray = transactionArray.slice(transactionArray.length - itemsOnPage - 1, transactionArray.length - 1);
  }  else {
    currentTransactionArray = transactionArray.slice(0, remains);
  }

  return currentTransactionArray;
}

function getCurrencyObject(currencyChangeData) {
  const reg = /"from":"(?<from>\w+)","to":"(?<to>\w+)","rate":(?<rate>\S+),"change":(?<change>\S+)}/i;
  const currentString = currencyChangeData.match(reg);
  const currencyChangeObject = {
    from: currentString.groups.from,
    to: currentString.groups.to,
    rate: currentString.groups.rate,
    change: Number(currentString.groups.change),
  }

  return currencyChangeObject;
}

export { 
  sortAccautnsAray, 
  getCords, 
  getBalanceString, 
  getDateString, 
  getUserCurrencyObjectArray, 
  getUserChoicesItems, 
  getAllChoicesItems,
  getChoicesItem,
  getCurrentTransactionArray,
  getCurrencyObject, 
}