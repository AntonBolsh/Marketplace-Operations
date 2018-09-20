const { Client, logger, Variables } = require('camunda-external-task-client-js');

// configuration for the Client:
//  - 'baseUrl': url to the Process Engine
//  - 'logger': utility to automatically log important events
const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger };

// create a Client instance with custom configuration
const client = new Client(config);

// susbscribe to the topic: 'charge-card'
client.subscribe('Order:CancelOrderUnpaid', async function({ task, taskService }) {

  const amount = task.variables.get('orderAmount');
  const quantity = task.variables.get('subOrderQuantity')
  var orderStatus = task.variables.get('orderStatus');
  var fullOrderNumber = task.variables.get('fullOrderNumber');  
  var subOrderSetString = task.variables.get('subOrdersSet');
  console.log(`Canceling unpaid order ${fullOrderNumber} - ${subOrderSetString}€ ... `);
 
  var subOrdersSet = JSON.parse(subOrderSetString);
  
  orderStatus = 'Canceled';
  for (var i = 0; i < quantity; i++) {
  subOrdersSet[i].subOrderStatus = orderStatus;
  console.log(`ChangedStatus ${i} - ${subOrdersSet[i].subOrderStatus}`);
  }

  subOrdersSetString = JSON.stringify(subOrdersSet);
  subOrdersSet = String(subOrdersSetString)
  console.log(`Canceling unpaid order ${orderStatus} - ${subOrderSetString} - ${subOrdersSet[0].subOrderStatus}€ ... `)
  const variables = new Variables().setAll( {orderStatus, subOrdersSet} );

  // Complete the task
  await taskService.complete(task, variables);
});


////////////////////////


client.subscribe('Order:SetPayment', async function({ task, taskService }) {

  const amount = task.variables.get('orderAmount');
  const quantity = task.variables.get('subOrderQuantity')
  var orderStatus = task.variables.get('orderStatus');
  var isPayedS = task.variables.get('isPayed');
  var isRefundedS = task.variables.get('isRefunded');
  var isPayed = (isPayedS == 'true');
  var isRefunded = (isRefundedS == 'true');
//Getting collection
  var subOrderSetString = task.variables.get('subOrdersSet');
  var subOrdersSet = JSON.parse(subOrderSetString);

  console.log(`Setting payment status for ${orderStatus}`);
 
    if (isPayed == 'true') {
    console.log(`Failed to set paid for ${orderStatus} - already paid`);
    throw new Error('failed to process refund: not paid');
  }
    if (isRefunded == 'true') {
    console.log(`Failed to set paid for ${orderStatus} - it is already refunded`);
    throw new Error('failed to process refund: already refunded');
  }

  isPayed = 'true';
  orderStatus = 'Оплачен';
  SubOrderStatus = 'Принят в обработку'

  for (var i = 0; i < quantity; i++) {
  subOrdersSet[i].subOrderStatus = SubOrderStatus;
  console.log(`ChangedStatus ${i} - ${subOrdersSet[i].subOrderStatus}`);
  }
  subOrdersSetString = JSON.stringify(subOrdersSet);
  subOrdersSet = String(subOrdersSetString)
  console.log(`${orderStatus} is Payed now.`);
  const variables = new Variables().setAll( {isPayed, orderStatus, subOrdersSet} );

  await taskService.complete(task, variables);
});

////////////////////////


client.subscribe('Order:Refund', async function({ task, taskService }) {

  var amount = task.variables.get('orderAmount');
  const quantity = task.variables.get('subOrderQuantity')
  var RefundedAmount = task.variables.get('RefundedAmount');
  var fullOrderNumber = task.variables.get('fullOrderNumber');
  var orderStatus = task.variables.get('orderStatus');
  var isPayedS = task.variables.get('isPayed');
  var isRefundedS = task.variables.get('isRefunded');
  var isPayed = (isPayedS == 'true');
  var isRefunded = (isRefundedS == 'true');
  console.log(`Refunding ${orderStatus} for amount of ${amount}€`);
 
    if (isPayed == 'false') {
    console.log(`Failed to refund ${orderStatus} - it is not paid`);
    throw new Error('failed to process refund: not paid');
  }
    if (isRefunded == 'true') {
    console.log(`Failed to refund ${orderStatus} - it is already refunded`);
    throw new Error('failed to process refund: already refunded');
  }

  isRefunded = 'true';
  RefundedAmount = amount;
  const variables = new Variables().setAll( {isRefunded, RefundedAmount} );
  console.log(`${fullOrderNumber} refunded for amount of ${RefundedAmount}€ ...`);

  //execution.setVariable(orderStatus, status);
  //task.variables.set('orderStatus', status);
  //await taskService.set('task', 'orderStatus', status);
  // Complete the task
  await taskService.complete(task, variables);
});






////////////SUBORDER
client.subscribe('MerchantStart', async function({ task, taskService }) {

  const loop = task.variables.get('loopCounter')
  console.log(`MerchantStart`);
 
  var subOrderSetString = task.variables.get('subOrdersSet');
  var subOrdersSet = JSON.parse(subOrderSetString);
  const SubOrderStatus = 'Комплектуется';
  subOrdersSet[loop].subOrderStatus = SubOrderStatus;
  console.log(`ChangedStatus ${loop} - ${subOrdersSet[loop].subOrderStatus}`);
 
  subOrdersSetString = JSON.stringify(subOrdersSet);
  subOrdersSet = String(subOrdersSetString)

  const variables = new Variables().setAll( {subOrdersSet} );

  // Complete the task
  await taskService.complete(task, variables);
});

client.subscribe('MerchantReject', async function({ task, taskService }) {

  const loop = task.variables.get('loopCounter')
  console.log(`MerchantReject`);
 
  var subOrderSetString = task.variables.get('subOrdersSet');
  var subOrdersSet = JSON.parse(subOrderSetString);
  const SubOrderStatus = 'Отказ Мерчанта';
  subOrdersSet[loop].subOrderStatus = SubOrderStatus;
  console.log(`ChangedStatus ${loop} - ${subOrdersSet[loop].subOrderStatus}`);
 
  subOrdersSetString = JSON.stringify(subOrdersSet);
  subOrdersSet = String(subOrdersSetString)

  const variables = new Variables().setAll( {subOrdersSet} );

  // Complete the task
  await taskService.complete(task, variables);
});



client.subscribe('MerchantComplete', async function({ task, taskService }) {

  const loop = task.variables.get('loopCounter')
  console.log(`MerchantComplete`);
 
  var subOrderSetString = task.variables.get('subOrdersSet');
  var subOrdersSet = JSON.parse(subOrderSetString);
  const SubOrderStatus = 'Комплектация завершена';
  subOrdersSet[loop].subOrderStatus = SubOrderStatus;
  console.log(`ChangedStatus ${loop} - ${subOrdersSet[loop].subOrderStatus}`);
 
  subOrdersSetString = JSON.stringify(subOrdersSet);
  subOrdersSet = String(subOrdersSetString)

  const variables = new Variables().setAll( {subOrdersSet} );

  // Complete the task
  await taskService.complete(task, variables);
});

///////


client.subscribe('RefundSubProcessing', async function({ task, taskService }) {

  console.log(`RefundSubProcessing`);
 
  var subOrderSetString = task.variables.get('subOrdersSet');
  var RefundedAmount = task.variables.get('RefundedAmount');
  const quantity = task.variables.get('subOrderQuantity');
  var isRefundedS = task.variables.get('isRefunded');
  var isRefunded = (isRefundedS == 'true');
  var subOrdersSet = JSON.parse(subOrderSetString);
  const SubOrderStatus = 'Комплектация завершена';
  var j = 0;

  for (var i = 0; i < quantity; i++) {
  	if (subOrdersSet[i].subOrderStatus == 'Отказ Мерчанта') 
  	{
  		j = j + 1;
        RefundedAmount = RefundedAmount + subOrdersSet[i].subOrderAmount;
  	} 
  	else 
  	{
  		if (subOrdersSet[i].City == 'Москва') {subOrdersSet[i].Carrier = '0 Mile'};
  		if (subOrdersSet[i].City == 'Новосибирск') {subOrdersSet[i].Carrier = '3PL'};

  	}
  }
  console.log(`RefundSubProcessing complete`);
  if (quantity == j) {isRefunded = 'true'}

  subOrdersSetString = JSON.stringify(subOrdersSet);
  subOrdersSet = String(subOrdersSetString)

  const variables = new Variables().setAll( {subOrdersSet, isRefunded, RefundedAmount} );

  // Complete the task
  await taskService.complete(task, variables);
});


////////////////

client.subscribe('ChangeOrderCancel', async function({ task, taskService }) {

  console.log(`ChangeOrderCancel`);
 
  var orderStatus = task.variables.get('orderStatus');
  orderStatus = 'Отменен';
  console.log(`RefundSubProcessing complete`);

  const variables = new Variables().setAll( {orderStatus} );

  // Complete the task
  await taskService.complete(task, variables);
});



