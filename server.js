
const express = require('express')
const WebSocket = require('ws');
const fetch = require('node-fetch');

const wss = new WebSocket.Server({ port: 3030 });

const USER_TOKEN = 'zdG0ni0BAc1hrzfsAV8LUIFAQnvEv4kFpmYV-0Kv7OW453Wi49x76hZ62DkOZrFMsEFU9WzLexYdhXngNdTN0xc8hAj3I7xknrYN0DV0x-K37j_5dnXWdWha3osG7p92oUDUBdG0bnrv67MaU-tfRZgsY0yS-TDi5NyOdVaPA1c';

const sendToAll = (ws) => (data) => {
  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}


let hackyConnection;

wss.on('connection', function connection(ws) {
  hackyConnection = ws;

  ws.on('message', sendToAll(ws));

  ws.on('message', async (data) => {
    console.log(data);
    const dataObj = JSON.parse(data)
    if (/\/.*/.test(dataObj.message)) {
      console.log('was a slash command')
      const response = await processSlashCommand(dataObj.message)

      ws.send(JSON.stringify({
        name: 'slashCommand',
        message: JSON.stringify(response)
      }));
    }
  });
});

const app = express()
const port = 3333

app.get('/oih-receiver', (req, res) => {
  hackyConnection.send(JSON.stringify({name: 'received from OIH', message: JSON.stringify([req.query, req.body, req.params])}))
  res.send('OK')
})

app.get('/callback', (req, res) => {
  console.log(req.query)
  hackyConnection.send(JSON.stringify({name: 'callback', message: JSON.stringify(req.query)}))
  //from here you could trigger a flow that takes a secret id creates a ms teams call
  res.send(req.query)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

async function processSlashCommand(request) {
  const parts = request.split(' ');
  const command = parts[0];
  const params = parts.splice(1)
  
  switch (command) {
    case '/auth':
      return startAuthRequest(params)
      break;
    case '/run-flow':
      return runFlow(params)
      break;
    default:
      console.log('command not recognized ' + command)
      return 'command not recognized ' + command
      break;
  }

  console.log(params);

}

async function startAuthRequest(params) {

  const body = {
    "scope": "User.Read",
    "secretName": "anything-secret",
    "successUrl": "http://localhost:3333/callback"
  };

  const response = await fetch("http://skm.example.com/api/v1/auth-clients/636bb8734754577fcef45ef3/start-flow", {
    "headers": {
      "accept": "application/json",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "authorization": `Bearer ${USER_TOKEN}`,
      "content-type": "application/json",
      "Referer": "http://skm.example.com/api-docs/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": JSON.stringify(body),
    "method": "POST"
  });

  const data = await response.json()

  return data.data.authUrl;
}

async function runFlow(params) {

  const response = await fetch(`http://webhooks.example.com/hook/${params[0]}`, {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "authorization": `Bearer ${USER_TOKEN}`,
      "content-type": "application/json",
      "sec-ch-ua": "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "Referer": "http://web-ui.example.com/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": JSON.stringify(params[1]),
    "method": "POST"
  });
  

  const data = await response.json()

  console.log(data)

  return data;
}