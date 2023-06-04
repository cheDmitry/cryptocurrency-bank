//Получаем длинну истории баланса в месяцах
import { accaunt } from "../../../index.js";

function getTransactionHistoryLength(transArray) {
  let historyLength = getMonthDifference(new Date(transArray[0].date), new Date());
  return historyLength;
};

//Получаем баланс на начало того месяца, что был 12 месяцев назад
function getOriginBalance(transactionsArray) {
  let originBalance = 0;
  let originBalanceArray = [];

  originBalanceArray = transactionsArray.filter(getOriginTransactionArray);
  originBalanceArray = originBalanceArray.map(getTransactionTypeObject);
  originBalance = countBalance(originBalanceArray);

  return originBalance;
};

//Получаем массив с балансами последних 12 месяцев
function getMonthsBalanse(transactionsArray) {
  let monthsBalanseArray = [];
  let originBalance = getOriginBalance(transactionsArray);
  let monthsTransactionsArray = getMonthsTransactionArray(transactionsArray);

  monthsTransactionsArray = monthsTransactionsArray.map((item) => {
    return item.map(getTransactionTypeObject);
  });

  monthsBalanseArray = monthsTransactionsArray.map((item) => {
    return countBalance(item);
  });

  monthsBalanseArray = monthsBalanseArray.map((item) => {
    let newItem = item + originBalance;
    originBalance = newItem;
    return newItem;
  });

  return monthsBalanseArray;
};

//Получаем объект с двумя свойствами. Первое - массив с суммой положительных транзакции, а второе с суммой отрицательных транзакций за последние 12 месяцев
function getSortMonthsBalansObject(transactionsArray) {
  let sortMonthsBalansObject = {};
  let monthsReceiptsArray = [];
  let monthsExpensesArray = [];
  let monthsTransactionsArray = getMonthsTransactionArray(transactionsArray);
  let monthsBalanseArray = getMonthsBalanse(transactionsArray);

  monthsTransactionsArray = monthsTransactionsArray.map((item) => {
    return item.map(getTransactionTypeObject);
  });

  monthsTransactionsArray.forEach((item, index) => {
    let sortCount;

    if (index === 0) {
      sortCount = countSortBalanse(item, getOriginBalance(transactionsArray))
    } else {
      sortCount = countSortBalanse(item, monthsBalanseArray[index - 1])
    };
    
    monthsReceiptsArray.push(sortCount.receipts);
    monthsExpensesArray.push(sortCount.expenses);
  });

  sortMonthsBalansObject.receipts = monthsReceiptsArray;
  sortMonthsBalansObject.expenses = monthsExpensesArray;

  return sortMonthsBalansObject;
};

//Возвращаем максимальную сумму положительных и отрицательных балансов
function getMaxMonthTransactionAmount(transactionArray) {
  const sortMonthsBalans = getSortMonthsBalansObject(transactionArray);
  let monthTransactionAmount = [];

  sortMonthsBalans.receipts.forEach((item, index) => {
    monthTransactionAmount.push(item + sortMonthsBalans.expenses[index]);
  });

  const MaxMonthTransactionAmount = Math.max(...monthTransactionAmount);

  return MaxMonthTransactionAmount;
}

//Фильтруеммассив транзакций так, чтобы в нём были только транзакции, старше 12 месяцев
function getOriginTransactionArray(item) {
  const currentDate = new Date();
  const originDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, 1);
  const transactionDate = new Date(item.date);
  
  if (transactionDate < originDate) {
    return true;
  }
};

//Возвращаем масств, который содержить объекты с типизированными свойствами транзакций
function getTypedTransactionArray(originTransactionArray) {
  return originTransactionArray.map(getTransactionTypeObject)
}

//Заменяем объект транзакции на объект, содержащий статус странзакции и сумму транзакции
function getTransactionTypeObject(item) {
  let transactionObject = {
    amount: item.amount,
    from: item.from,
    to: item.to,
    date: item.date,
  }

  if (item.to === accaunt) {
    transactionObject.type = 1;
  }else { 
    transactionObject.type = -1;
  };

  return transactionObject;
};

//Считаем баланс за месяц
function countBalance(tranceArray) {
  let balance = 0;

  tranceArray.forEach((item) => {
    if (item.type > 0) {
      balance += item.amount;
    } else {
      balance -= item.amount;
    };
  });

  return balance;
};

//Считаем отдельно положительные и отрицательные транзакции
function countSortBalanse(transeArray, lastMonthBalanse) {
  let sortCount = {
    receipts: 0,
    expenses: 0,
  };

  if (lastMonthBalanse > 0) {
    sortCount.receipts += lastMonthBalanse;
  } else if (lastMonthBalanse < 0) {
    sortCount.expenses -= lastMonthBalanse
  };

  transeArray.forEach((item) => {
    if (item.type > 0) {
      sortCount.receipts += item.amount;
    } else {
      sortCount.expenses += item.amount;
    };
  });  

  return sortCount;
};

//Получаем массив с массивами транзакций за каждый месяц
function getMonthsTransactionArray(tranceArray) {
  let monthsTransactionArray = []; 
  const currentDate = new Date();

  for (let i = 11; i >= 0; i--) {
    let monthTrancactionArray = [];

    monthTrancactionArray = tranceArray.filter((item) => {
      const itemDate = new Date(item.date);
      const firstDateLimit = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      let secondDateLimit = null;

      if (i !== 0) {
        secondDateLimit = new Date(currentDate.getFullYear(), currentDate.getMonth() - (i - 1), 1);
      } else {
        secondDateLimit = currentDate;
      }

      if (itemDate >= firstDateLimit && itemDate <= secondDateLimit) {
        return true;
      }
    });



    monthsTransactionArray.push(monthTrancactionArray);
  };

  
  console.log('Month');

  console.log(tranceArray);
  console.log(monthsTransactionArray);

  return monthsTransactionArray;
};

//Получаем время между двумя датами в месяцах
function getMonthDifference(startDate, endDate) {
  if (startDate.getMonth() !== endDate.getMonth()) {
    return (
      endDate.getMonth() -
      startDate.getMonth() +
      12 * (endDate.getFullYear() - startDate.getFullYear()) + 1
    );
  } else {
    return 1;
  }


};

export { 
  getOriginBalance, 
  getTypedTransactionArray, 
  getMonthsBalanse, 
  getSortMonthsBalansObject, 
  getTransactionHistoryLength,
  getMaxMonthTransactionAmount, 
};

