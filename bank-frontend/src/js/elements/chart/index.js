import Chart from 'chart.js/auto';
import { getMonthsBalanse, getSortMonthsBalansObject, getMaxMonthTransactionAmount,  getTransactionHistoryLength} from '../transaction-data-util/index.js';
import { getBalanceString } from '../../data-utils.js';
Chart.defaults.color = '#000000';

const monthsArray = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',]
let dynamicChart = null;
let stackChart = null;




function createStandartChart(chartContainerSelector, accauntObject, collumNumber) {
  let monthsBalanseArray = getMonthsBalanse(accauntObject.transactions);
  let chartDataObject = getChartDateObject(accauntObject.transactions, monthsBalanseArray, collumNumber);  

  const container = document.querySelector(chartContainerSelector);
  const chart = container.querySelector('.chart');
  const countTop = container.querySelector('.count-top')
  const countBottom = container.querySelector('.count-bottom');
  countTop.textContent = `${getBalanceString(Math.max(...chartDataObject.balanceArray))} ₽`;
  countBottom.textContent = '0 ₽'; 

  dynamicChart = new Chart(chart, {
    type: 'bar',
    data: {
      labels: chartDataObject.monthsArray,
      datasets:[{
        data: chartDataObject.balanceArray,
        backgroundColor: '#116ACC',
      }]
    },
    options: {
      aspectRatio: getAspectRotation(),
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            display: true,
            padding: -2,
            font: {
              size: getChartFontParametrs().size,
              lineHeight: getChartFontParametrs().lineHeight,
              weight: 700,              
            }
            
          },
          grid: {
            display: false,
          },
        },
        y: {
          display: false,
          beginAtZero: true,
          ticks: {
            display: false,
            padding: 3,
            stepSize: 1,
          },
          grid: {
            display: true,
          }
        }
      },
      plugins: {
        legend: {
          display: false,
          labels: {
            font: {
              size: 100
            },
          }
        },
        tooltip: {
          enabled: false
        },
        labels: {          
        }
      }
    }
  })
};

function createStackChart(chartContainerSelector, accauntObject, collumNumber) {
  const sortMonthsBalans = getSortMonthsBalansObject(accauntObject.transactions);
  const maxTransactionAmount = getMaxMonthTransactionAmount(accauntObject.transactions);
  const expenceBalanceObject = getChartDateObject(accauntObject.transactions, sortMonthsBalans.expenses, collumNumber);
  const receiptsBalanceObject = getChartDateObject(accauntObject.transactions, sortMonthsBalans.receipts, collumNumber);

  const container = document.querySelector(chartContainerSelector);
  const chart = container.querySelector('.chart');
  const countTop = container.querySelector('.count-top');
  const countMid = container.querySelector('.count-mid');
  countTop.textContent = `${getBalanceString(maxTransactionAmount)} ₽`;
  countMid.textContent = `${getBalanceString(maxTransactionAmount / 2) } ₽`;

  stackChart = new Chart(chart, {
    type: 'bar',
    data: {
      labels: receiptsBalanceObject.monthsArray,
      datasets: [
        {
          label: 'Expenses',
          data: expenceBalanceObject.balanceArray,
          backgroundColor: '#FD4E5D',
        },
        {
          label: 'Receipts',
          data: receiptsBalanceObject.balanceArray,
          backgroundColor: '#76CA66',
        },
      ]
    },
    options: {
      aspectRatio: getAspectRotation(),
      scales: {
        x: {
          stacked: true,
          beginAtZero: true,
          ticks: {
            display: true,
            padding: -2,
            font: {
              size: getChartFontParametrs().size,
              lineHeight: getChartFontParametrs().lineHeight,
              weight: 700,              
            }
            
          },
          grid: {
            display: false,
          },
        },
        y: {
          stacked: true,
          display: false,
          beginAtZero: true,
          ticks: {
            display: false,
            padding: 3,
            stepSize: 20,
          },
          grid: {
            display: true,
          }
        }
      },
      plugins: {
        legend: {
          display: false,
          labels: {
            font: {
              size: 100
            },
          }
        },
        tooltip: {
          enabled: false
        },
        labels: {
          
        }
      }
    }
  })
}

// XLV
// Получаем объект с данными для таблицы
function getChartDateObject(transactionsArray, monthsBalanseArray, monthsNumber) {
  let chartDataObject = {};

  if (transactionsArray.length === 0) {
    chartDataObject.monthsArray = [''];
    chartDataObject.balanceArray = [0];  
    return chartDataObject;
  }

  const transactionHistoryLength = getTransactionHistoryLength(transactionsArray);
  let balanceArray = null;
  let monthsArray = null;

  if (transactionHistoryLength >= monthsNumber) {
    monthsArray = getLastMonthsArray(monthsNumber);
    balanceArray = monthsBalanseArray.splice(monthsBalanseArray.length - monthsNumber, monthsNumber);
  } else {
    monthsArray = getLastMonthsArray(transactionHistoryLength);
    balanceArray = monthsBalanseArray.splice(monthsBalanseArray.length - transactionHistoryLength, transactionHistoryLength);

    while (monthsArray.length < monthsNumber && balanceArray.length < monthsNumber) {
      monthsArray.unshift('   ');
      balanceArray.unshift(0);
    }
  }

  balanceArray = balanceArray.map((item) => {
    if (item < 0) {
      return 0
    } else {
      return item;
    }
  })

  chartDataObject.monthsArray = monthsArray;
  chartDataObject.balanceArray = balanceArray;

  return chartDataObject;
}

// XLVI
// Получаем массив последних несколких месяцев
function getLastMonthsArray(monthsNumber) {
  let lastMonthsArray = [];
  const currentDate = new Date();
  for (let i = 0; i < monthsNumber; i++) {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    lastMonthsArray.unshift(monthsArray[newDate.getMonth()]);
  }
  return lastMonthsArray;
}

function getAspectRotation() {
  if (document.querySelector('.history-content') && document.documentElement.clientWidth >= 1024) {
    return 5 | 1;
  } else if (document.querySelector('.history-content') && document.documentElement.clientWidth < 1024) {
    return 3 | 2;
  } else {
    return 2 | 2
  }
}

function getChartFontParametrs() {
  let fontParametrObject = {};

  if (document.querySelector('.history-content') && document.documentElement.clientWidth > 1024) {
    fontParametrObject.size = 20;
    fontParametrObject.lineHeight = '23px';
  } else if (document.querySelector('.history-content') && document.documentElement.clientWidth < 1024) {
    fontParametrObject.size = 12;
    fontParametrObject.lineHeight = '14px';
  } else {
    fontParametrObject.size = 20;
    fontParametrObject.lineHeight = '23px';
  }

  return fontParametrObject;
}

export { createStandartChart, createStackChart };