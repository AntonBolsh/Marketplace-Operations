// Basic Node.JS worker that subscribes to an external task 'Start' 
// Returns Task attributes to the console and completes the task


const { Client, logger, Variables } = require('camunda-external-task-client-js');
const config = { baseUrl: 'http://35.228.34.24:8080/engine-rest', use: logger };
const client = new Client(config);

client.subscribe('Start', async function({ task, taskService }) {
  console.log('completing' + JSON.stringify(task));
  // Complete the task
  await taskService.complete(task);
});