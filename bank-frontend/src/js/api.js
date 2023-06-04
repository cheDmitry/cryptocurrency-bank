import { token } from "./dom.js";

// Входим в аккаунт и получаем токен 
function getLoginToken(login, password) {
  return fetch('http://localhost:3000/login', {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({login: `${login}`, password: `${password}`})
  })
    .then((resp) => {
      return resp.json();
    })
    .then((tokenObject) => {
      return tokenObject;
    })
}

// XV
// Получаем объект с информацией о счёте
function getAccauntInfo(accauntId, token) {
  return fetch(`http://localhost:3000/account/${accauntId}`, {
    method: 'GET',
    headers: {'Authorization': `Basic ${token}`},
  })
    .then((resp) => {
      return resp.json();
    })
    .then((accauntObject) => {
      return accauntObject;
    });
}

// XX
// Получаем данные о валютах пользователя всех известных валютах
function getCurrency(token) {
  return Promise.all([
    fetch('http://localhost:3000/currencies', {
      method: 'GET',
      headers: {'Authorization': `Basic ${token}`},
    }),
    fetch('http://localhost:3000/all-currencies', {
      method: 'GET',
      headers: {'Authorization': `Basic ${token}`},
    }),
  ])
    .then(([currencyResp, allCurrencyResp]) => {
      return Promise.all([currencyResp.json(), allCurrencyResp.json()]);
    })
    .then(([currency, allCurrency]) => {
      return [currency.payload, allCurrency.payload];
    });
}

// XXI
// Получаем координаты банкоматов
function getBanks(token) {
  return fetch('http://localhost:3000/banks', {
    method: 'GET',
    headers: {'Authorization': `Basic ${token}`},
  })
    .then((resp) => {
      return resp.json();
    })
    .then((resp) => {
      return resp.payload;
    });
}

// XXIII/1
// Создаём новый аккаунт
function createNewAccaunt(token) {
  return fetch('http://localhost:3000/create-account', {
    method: 'POST',
    headers: {'Authorization': `Basic ${token}`},
  });
}

// XXIV/1
// Получаем информацию о счтах пользователя
function getAccaunts(token) {
  return fetch('http://localhost:3000/accounts', {
    method: 'GET',
    headers: {'Authorization': `Basic ${token}`},
  })
    .then((resp) => {
      return resp.json();
    })
    .then((resp) => {
      return resp.payload;
    })
}

// LVIII
// Совершаем валютный обмен 
function buyCurrency(fromCurrency, toCurrency, amount, token) {
  return fetch('http://localhost:3000/currency-buy', {
    method: 'POST',
    headers: {'Authorization': `Basic ${token}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({from: fromCurrency, to: toCurrency, amount: amount}),
  })
    .then((resp) => {
      return resp.json();
    })
    .then((resp) => {
      return resp; 
    })
}

// LX
// Осуществляем перевод средств
function transferFounds(fromAccaunt, toAccaunt, amount) {
  return fetch('http://localhost:3000/transfer-funds', {
    method: 'POST',
    headers: {'Authorization': `Basic ${token}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({from: `${fromAccaunt}`, to: `${toAccaunt}`, amount: `${amount}`})
  })
    .then((resp) => {
      return resp.json();
    })
    .then((resp) => {
      return resp; 
    })
}

export {
  getLoginToken, 
  getAccauntInfo, 
  getCurrency, 
  getBanks, 
  createNewAccaunt, 
  getAccaunts, 
  buyCurrency, 
  transferFounds 
}