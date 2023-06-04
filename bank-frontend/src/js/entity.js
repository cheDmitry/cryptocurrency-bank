const loginErrorMessageObject = {
  'Invalid password': 'Неверный пароль',
  'No such user': 'Такого пользователя не существует'
};

const cardsMonthsArray = [
  'января', 
  'февраля', 
  'марта', 
  'апреля', 
  'мая', 
  'июня', 
  'июля', 
  'августа', 
  'сентября', 
  'октября', 
  'ноября', 
  'декабря',
];

const handledExchangeError = {
  'Unknown currency code': 'Валюта не потдерживается',
  'Invalid amount': 'Не указана сумма перевода',
  'Not enough currency': 'На вешем счету нет средств',
  'Overdraft prevented': 'На счету недостаточно средств',
}

const handledTransferError = {
  'Wrong account': 'Неверный счёт получателя',
  'Unknown currency code': 'Валюта не потдерживается',
  'Invalid amount': 'Не указана сумма перевода',
  'Not enough currency': 'На вешем счету нет средств',
  'Overdraft prevented': 'Недостаточно средств',
}



export { loginErrorMessageObject, cardsMonthsArray, handledExchangeError, handledTransferError }