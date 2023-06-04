import { getCords, getBalanceString, getDateString, getUserCurrencyObjectArray, getChoicesItem, getAllChoicesItems, getUserChoicesItems, getCurrencyObject } from "./src/js/data-utils";

//Тестируем получения масства координат для создания яндекс карт
test('Валидация функции преобразования масства объекта координат в масств координат для яндекс карт', () => {
  expect(getCords([{lat: 13, lon: 14}, {lat: 23.42, lon: 24.3333}])).toEqual([[13, 14], [23.42, 24.3333]]);
});


//Тестируем функцию преобразования цифры баланса в строку баланса с разделением 3х знаков и отделением дробной части
test('Валидация получения строки баланса с ненулевой дробной частью', () => {
  expect(getBalanceString(1232.23)).toBe('1 232.23');
  expect(getBalanceString(232.23)).toBe('232.22');
  expect(getBalanceString(1232.233223)).toBe('1 232.23');
  expect(getBalanceString(121232.233223)).toBe('121 232.23');
  expect(getBalanceString(121232.2)).toBe('121 232.19');
})

test('Валидация получения строки баланса с нулевой дробной частью', () => {
  expect(getBalanceString(1232)).toBe('1 232.00');
})


//Тестируем функцию преобразующую строку с датой стандарта ISO 8601 в строку с датой
test('Валидация получения строки с датой', () => {
  expect(getDateString('2023-04-20T17:28:24.456Z')).toBe('20 апреля 2023');
})


//Тестируем функцию для получения массива с объектами валют пользователя
test('Валидация получения масства с объектами валют', () => {
  const userCurrencyObject = {
    "AUD": {
      "amount": 22.16,
      "code": "AUD"
    },
    "BTC": {
      "amount": 3043.34,
      "code": "BTC"
    },
  };

  const currencyObjectArray =  [
    {
      amount: 22.16, 
      code: 'AUD'
    }, 
    {
      amount: 3043.34, 
      code: 'BTC'
    }
  ];
  expect(getUserCurrencyObjectArray(userCurrencyObject)).toEqual([{amount: 22.16, code: 'AUD'}, {amount: 3043.34, code: 'BTC'}])
});


// Тестируем функцию создания элемента для кастомного селекта
test('Валидация получения элемента кастомного селекта', () => {
  expect(getChoicesItem('AUD', 0)).toEqual({value: 'AUD', label: 'AUD', selected: true});
  expect(getChoicesItem('AUD', 1)).toEqual({value: 'AUD', label: 'AUD', selected: false});
  expect(getChoicesItem('AUD', 12)).toEqual({value: 'AUD', label: 'AUD', selected: false});
});


//Тестируем функцию для получения масства даных для кастомного селекта
test('Валидация функции получения масства всех валют для кстомного селекта', () => {
  const currencyArray = ['AUD', 'BTC'];
  const currentItemArray = [
    {
      value: 'AUD',
      label: 'AUD',
      selected: true,
    },
    {
      value: 'BTC',
      label: 'BTC',
      selected: false,
    },
  ]
  expect(getAllChoicesItems(currencyArray)).toEqual(currentItemArray);
});

test('Валидация функции получения масства валют пользователя для кстомного селекта', () => {
  const currencyArray = [{code: 'AUD', amount: 23,}, {code: 'BTC', amount: 23}];
  const currentItemArray = [
    {
      value: 'AUD',
      label: 'AUD',
      selected: true,
    },
    {
      value: 'BTC',
      label: 'BTC',
      selected: false,
    },
  ]
  expect(getUserChoicesItems(currencyArray)).toEqual(currentItemArray);
});

//Тестируем функцию преобразования строки с данными о изменении курса валютной пары в объект с данными об изменении курса валютной пары
test('Валидация преобразования строки валютной пары в объект с данными об изменении курса', () => {
  const currencyString = '{"type":"EXCHANGE_RATE_CHANGE","from":"ETH","to":"RUB","rate":5.77,"change":-1}';
  const currencyObject = {
    from: 'ETH',
    to: 'RUB',
    rate: '5.77',
    change: -1,
  }
  expect(getCurrencyObject(currencyString)).toEqual(currencyObject);
});