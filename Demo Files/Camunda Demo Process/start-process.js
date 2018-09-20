const {
  fetch
} = require('camunda-worker-node/lib/engine/fetch');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

async function startProcess() {
  const engineEndpoint = process.env.ENGINE_URL || 'http://localhost:8080/engine-rest';
  var businessKeyValue = String(getRandomInt(100000, 100000000));
  var CreationDate = new Date();
  var orderStatus = 'Оформлен';
  var subOrderQuantity = getRandomInt(2, 4);
  var isPayed = false;
  var isRefunded = false;
  var RefundedAmount = 0;
  var subOrderAmount;
  var subOrderNumber;
  var orderAmount = 0;
  var fullOrderNumber = 'MP000'+ String(getRandomInt(1000, 9999));
  var subOrderStatus = 'Создан';
  var Merchant;
  var City;
  var subOrder;
  var Carrier = 'null';
  
  var subOrdersSet = [];

  for (var i = 1; i <= subOrderQuantity; i++) {
  subOrderAmount = getRandomInt(1000, 10000);
  subOrderNumber = fullOrderNumber + '_00' + String(i);
  if (getRandomInt(1, 5) > 3) { Merchant = 'Клео' } else { Merchant = 'Трио Сибтекстиль' }
  if (Merchant == 'Клео') { City = 'Москва' } else { City = 'Новосибирск' }
  subOrder = { subOrderNumber: subOrderNumber, subOrderAmount: subOrderAmount, subOrderStatus: subOrderStatus, Merchant: Merchant, City: City, Carrier: Carrier };
  subOrdersSet.push(subOrder)
  orderAmount = orderAmount + subOrderAmount;
  }



// Variables are specified below
/*
body: JSON.stringify({
      variables: {
        goods: {
          value: JSON.stringify(goods),
          type: 'Json'
        }
      }
    }),
*/
  fetch(engineEndpoint + '/process-definition/key/OrderExecute/start', {
    method: 'POST',
    body: JSON.stringify({
      variables: {
        fullOrderNumber: {
          value: fullOrderNumber,
          type: 'String'
        },
        orderStatus: {
          value: orderStatus,
          type: 'String'
        },
        date: {
          value: CreationDate,
          type: 'String'
        },
        orderAmount: {
          value: orderAmount,
          type: 'long'
        },
        isPayed: {
          value: isPayed,
          type: 'boolean'
        },
        isRefunded: {
          value: isRefunded,
          type: 'boolean'
        },
        RefundedAmount: {
          value: RefundedAmount,
          type: 'long'
        },
        subOrderQuantity: {
          value: subOrderQuantity,
          type: 'long'
        },
        subOrdersSet: {
          value: JSON.stringify(subOrdersSet),
          type: 'String'
        }
      },
      businessKey : businessKeyValue
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(function(response) {

    var status = response.status;

    if (status === 200) {
      console.log(`started new OrderProcess ${fullOrderNumber} - businessKey: ${businessKeyValue} - quantity ${subOrderQuantity}`);
    } else {
      console.error('failed to start orderProcess (status=%s)', status);

      response.json().then(function(json) {
        console.log(json);
      });
    }
  });
}


function isSteam() {
  const lastArg = process.argv[process.argv.length - 1];

  return lastArg === '--stream';
}


if (isSteam()) {

  (async function() {
    for (var i = 0; i < 1000; i++) {
      await startProcess();
    }
  })();
} else {
  startProcess();

}