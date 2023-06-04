///<reference types="cypress" />

// Программа банка
describe('Страница авторизации', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/');
  })

  it('Авторизация не происходит, если оба поля не заполнены', () => {
    cy.get('.log-input').type(' ');
    cy.get('.password-input').type(' ');
    cy.get('.login-form-button').click();
    cy.get('.login-alert-span').should('contain.text', 'Поля должны содержать 6 символов и не cодержать пробелов');
  });
  
  it('Авторизация не происходит, если одно поле не заполнено', () => {
    cy.get('.log-input').type('user1234');
    cy.get('.password-input').type(' ');
    cy.get('.login-form-button').click();
    cy.get('.login-alert-span').should('contain.text', 'Поля должны содержать 6 символов и не cодержать пробелов');
    cy.get('.log-input').clear();
    cy.get('.password-input').type('password');
    cy.get('.login-form-button').click();
    cy.get('.login-alert-span').should('contain.text', 'Поля должны содержать 6 символов и не cодержать пробелов');
  }); 

  it('Авторизация не происходит, если введён неверный логин', () => {
    cy.get('.log-input').type('user12');
    cy.get('.password-input').type('password');
    cy.get('.login-form-button').click();
    cy.get('.login-alert-span').should('contain.text', 'Такого пользователя не существует');
  });
  
  it('Авторизация не происходит, если введён неверный пароль', () => {
    cy.get('.log-input').type('developer');
    cy.get('.password-input').type('password');
    cy.get('.login-form-button').click();
    cy.get('.login-alert-span').should('contain.text', 'Неверный пароль');
  });
  
  it('Невалидные поля подсвечиваются', () => {
    cy.get('.log-input').type('developer');
    cy.get('.password-input').type(' ');
    cy.get('.login-form-button').click();
    cy.get('.input--alert').should('have.length', '1');
  });

  it('Невалидные поля перестают подсвечиваться после ввода в них символов', () => {
    cy.get('.log-input').type('developer');
    cy.get('.password-input').type(' ');
    cy.get('.login-form-button').click();
    cy.get('.password-input').clear();
    cy.get('.password-input').type('p');
    cy.get('.input--alert').should('have.length', '0');
  });

  it('Авторизация происходит при введении крректных данных', () => {
    cy.get('.log-input').type('developer');
    cy.get('.password-input').type('skillbox');
    cy.get('.login-form-button').click();
    cy.get('.accaunt-top').should('have.length', '1');
    cy.get('.accaunts-bottom').should('have.length', '1');
  });
})

describe('Страница счетов', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/');
    cy.get('.log-input').type('developer');
    cy.get('.password-input').type('skillbox');
    cy.get('.login-form-button').click();
  })

  it('Все кнопки главного меню рабтают', () => {
    cy.contains('Валюта').click();
    cy.get('.your-currency').should('have.length', '1');
    cy.get('.exchange-currency').should('have.length', '1');
    cy.get('.currency-change').should('have.length', '1');

    
    cy.contains('Счета').click();
    cy.get('.accaunt-top').should('have.length', '1');
    cy.get('.accaunts-bottom').should('have.length', '1');

    cy.contains('Банкоматы').click();
    cy.get('#map').should('have.length', '1');

    cy.contains('Выход').click();
    cy.get('.login-container').should('have.length', '1');
  });
  
  it('Новый счёт создаётся', () => {
    let ogiginCardsNumber = 0;
    cy.get('.accaunts-card').each((cards) => {
      ogiginCardsNumber += 1;
    }).then(() => {
      cy.contains('Создать новый счёт').click();
      cy.get('.accaunts-card').should('not.have.length', `${ogiginCardsNumber}`);
    })
  });

  it('Переходит на страницу просмотрасчёта', () => {
    cy.contains('Открыть').click();
    cy.get('.accaunt-content').should('have.length', '1');
  });
})

describe('Страница просмотра счёта', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/');
    cy.get('.log-input').type('developer');
    cy.get('.password-input').type('skillbox');
    cy.get('.login-form-button').click();
    cy.contains('Открыть').click();
  })

  it('Все элементы страницы создаются', () => {
    cy.get('.accaunt-header').should('have.length', '1');
    cy.get('.accaunt-content-top').should('have.length', '1');
    cy.get('.accaunt-content-mid-left').should('have.length', '1');
    cy.get('.accaunt-content-mid-right').should('have.length', '1');
    cy.get('.accaunt-content-bottom').should('have.length', '1');
  });

  it('Кнопка вернуться назад переводит на страницу просмотра счетов', () => {
    cy.contains('Вернуться назад').click();
    cy.get('.accaunt-top').should('have.length', '1');
    cy.get('.accaunts-bottom').should('have.length', '1');
  });

  it('Отправка формы нового переавода не происходит если не все поля заполнены', () => {
    cy.get('.accaunt-select').clear();
    cy.get('.acaunt-transfer-amount-input').clear();
    cy.contains('Отправить').click();
    cy.get('.alert-span').should('not.have.class', 'hidden')

    cy.get('.accaunt-select').clear();
    cy.get('.acaunt-transfer-amount-input').clear();
    cy.get('.accaunt-select').type('14211212321124');
    cy.contains('Отправить').click();
    cy.get('.alert-span').should('not.have.class', 'hidden')

    cy.get('.accaunt-select').clear();
    cy.get('.acaunt-transfer-amount-input').clear();
    cy.get('.acaunt-transfer-amount-input').type('20');
    cy.contains('Отправить').click();
    cy.get('.alert-span').should('not.have.class', 'hidden')
  });

  it('Если поля формы не заполнены, то они подсвечиваются', () => {
    cy.get('.accaunt-select').clear();
    cy.get('.acaunt-transfer-amount-input').clear();
    cy.contains('Отправить').click();
    cy.get('.input--alert').should('have.length', '2');
  });

  it('Поля ввода перестают подсвечиваться полсле того, как в них', () => {
    cy.get('.accaunt-select').clear();
    cy.get('.acaunt-transfer-amount-input').clear();
    cy.contains('Отправить').click();
    cy.get('.accaunt-select').type('1');
    cy.get('.acaunt-transfer-amount-input').type('1');
    cy.get('.input--alert').should('have.length', '0');
  });

  it('Нажатие на график переводит на страницу истории баланса', () => {
    cy.get('.accaunt-content-mid-right').click();
    cy.get('.history-content').should('have.length', '1');
  });

  it('Нажатие на график переводит на страницу истории баланса', () => {
    cy.get('.accaunt-content-bottom').click();
    cy.get('.history-content').should('have.length', '1');
  });
})

describe('Страница счетов', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/');
    cy.get('.log-input').type('developer');
    cy.get('.password-input').type('skillbox');
    cy.get('.login-form-button').click();
    cy.contains('Открыть').click();
    cy.get('.accaunt-content-mid-right').click();
  })

  it('Все элементы странцы истории баланса создаются', () => {
    cy.get('.history-header').should('have.length', '1');
    cy.get('.accaunt-content-top').should('have.length', '1');
    cy.get('.history-dynamic-chart-container').should('have.length', '1');
    cy.get('.history-ratio-chart-container').should('have.length', '1');
    cy.get('.accaunt-content-bottom').should('have.length', '1');
  })

  it('Кнопка вернуться назад возвращает на страницу просмотра счёта', () => {
    cy.contains('Вернуться назад').click();
    cy.get('.accaunt-content').should('have.length', '1');
  })
})

describe('Страница валют', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/');
    cy.get('.log-input').type('developer');
    cy.get('.password-input').type('skillbox');
    cy.get('.login-form-button').click();
    cy.contains('Валюта').click();
  })

  it('Все элементы странцы истории баланса создаются', () => {
    cy.get('.currency-title').should('have.length', '1');
    cy.get('.your-currency').should('have.length', '1');
    cy.get('.exchange-currency').should('have.length', '1');
    cy.get('.currency-change').should('have.length', '1');
  })

  it('Если поле сумма не заполнено, но оно подсвечивается и появляется надпись с предупреждением', () => {
    cy.get('.exchange-currency-amount-input').clear();
    cy.contains('Обменять').click();
    cy.get('.input--alert').should('have.length', '1');
    cy.contains('Укажите сумму перевода').should('have.length', '1');
  })

  it('После введения в поле сумма значения подсветка и предупреждающия надпись пропадают', () => {
    cy.get('.exchange-currency-amount-input').clear();
    cy.contains('Обменять').click();
    cy.get('.exchange-currency-amount-input').type('1');
    cy.get('.input--alert').should('have.length', '0');
    cy.get('.hidden').should('have.length', '1');
  })
})