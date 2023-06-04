import './style/normolize.css';
import './style/style.css';

import Navigo from 'navigo';

import { token, initializingApp, createLoginContent, createHeaderNav, createAccauntsPage, createAccauntPage,  createAccauntHistoryPage, createCurrencyPage, createAtmsPage, clearToken} from './js/dom.js'
import { clearContainer, activeNavLink } from './js/dom-utils.js'

// Создаём и резолвим переменную роутера
const router = new Navigo('/');
router.resolve();
console.log('nav');

// Инициируем приложение
initializingApp();

// Объявляем основные перменные
const headerContainer = document.querySelector('.header-container');
const appContainer = document.querySelector('.app-container');
const contentContainer = document.querySelector('.content-container');
let accaunt = null


// Реагируем на переход на страницу входа
router.on('/login', () => {
  clearContainer(contentContainer);
  clearToken();

  if (document.querySelector('.header-nav')) {
    document.querySelector('.header-nav').remove();
  }

  createLoginContent(contentContainer);
});

//Реагирум на переход на страницу счетов
router.on('/accaunts', () => {
  if (token === null) {
    router.navigate('/login');
    return;
  }

  if (!document.querySelector('.header-nav')) {
    createHeaderNav(headerContainer);
  };

  clearContainer(contentContainer);
  createAccauntsPage(contentContainer, token);
  activeNavLink('.js-link-accaunts');
});

// Реагируем на переход на страницу просмотра счёта
router.on('/accounts/:account', ({data}) => {
  if (token === null) {
    router.navigate('/login');
    return;
  }

  clearContainer(contentContainer);

  if (document.querySelector('.nav-link--active')) {
    document.querySelector('.nav-link--active').classList.remove('nav-link--active');
  };

  console.log(data);

  createAccauntPage(contentContainer, data.account);

  accaunt = data.account;
});

//Реагируем на преход на страницу истории баланса
router.on('/accaunts/history/:account', ({data}) => {
  if (token === null) {
    router.navigate('/login');
    return;
  }

  clearContainer(contentContainer);

  if (document.querySelector('.nav-link--active')) {
    document.querySelector('.nav-link-active').classList.remove('nav-link-active');
  };

  createAccauntHistoryPage(contentContainer, data.account);
});

// Реагируем на переход на страницу валют
router.on('/currency', () => {
  if (token === null) {
    router.navigate('/login');
    return;
  }

  clearContainer(contentContainer);
  activeNavLink('.js-link-currency');

  createCurrencyPage(contentContainer);
});

// Реагируем на переход на страницу банкоматов
router.on('/atms', () => {
  if (token === null) {
    router.navigate('/login');
    return;
  }

  clearContainer(contentContainer);
  activeNavLink('.js-link-atms');
  createAtmsPage(contentContainer);
});

//Переходим на страницу входа в аккаунт
router.navigate('/login');

export {router, token, accaunt}

