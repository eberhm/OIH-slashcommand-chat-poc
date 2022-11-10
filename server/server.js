
const express = require('express')
const WebSocket = require('ws');
const { processSlashCommand } = require('./slashCommands');

const WS_PORT = 3030;
const EXPRESS_PORT = 3333;

const wss = new WebSocket.Server({ port: WS_PORT });
const app = express();

let hackyConnection;
let hackySecretId;

// WEBSOCKETS SERVER
wss.on('connection', function connection(ws) {
  hackyConnection = ws;

  ws.on('message', sendToAll(ws));

  ws.on('message', async (data) => {
    console.log(data);
    const dataObj = JSON.parse(data)
    if (/\/.*/.test(dataObj.message)) {
      console.log('was a slash command')
      const response = await processSlashCommand(dataObj.message, hackySecretId)

      ws.send(JSON.stringify({
        name: 'slashCommand',
        message: JSON.stringify(response)
      }));
    }
  });
});

const sendToAll = (ws) => (data) => {
  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

//EXPRESS SERVER
app.use(express.json());

app.post('/oih-receiver', (req, res) => {
  console.log(req.body)
  hackyConnection.send(JSON.stringify({name: 'received from OIH', message: JSON.stringify(req.body)}))
  res.send('OK')
})

app.get('/callback', (req, res) => {
  console.log(req.query)
  hackyConnection.send(JSON.stringify({name: 'callback', message: JSON.stringify(req.query)}))
  hackySecretId = req.query.secretId;
  //from here you could trigger a flow that takes a secret id creates a ms teams call
  res.send(req.query)
})

app.get('/_health', (req, res) => {
  res.send('OK')
})

app.listen(EXPRESS_PORT, () => {
  console.log(`Example app listening on port ${EXPRESS_PORT}`)
})