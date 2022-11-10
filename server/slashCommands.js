const fetch = require('node-fetch');

const USER_TOKEN = 'O2NjzhvEVxSTzgj9YFR8Qu6f5vqFeQp1NoJKcc_3qPDCKYy6lk8d05YC9lB5fo2lAnVivvc70G7FL0zgLfRqe1PJ4c6ib2gAQgGds3V2UwRrqtCJuzFM25BvdJ1Ms072rGQrHodInX480gLk8exyhALsNF_5kMW_3101fQVe9dw';

async function processSlashCommand(request, secretId) {
    const parts = request.split(' ');
    const command = parts[0];
    const params = parts.splice(1)
    console.log('slashCommand Params:', params);

    switch (command) {
      case '/auth':
        return startAuthRequest(params)
        break;
      case '/run-flow':
        return runFlow(params, secretId)
        break;
      default:
        console.log('command not recognized ' + command)
        return 'command not recognized ' + command
        break;
    }
  }
  
  async function startAuthRequest(params) {
  
    const body = {
      "scope": "User.Read",
      "secretName": "anything-secret",
      "successUrl": "http://localhost:3333/callback"
    };
  
    const response = await fetch('http://webhooks.example.com/hook/636cc8f629df4f8df8c8a70d', {
      "headers": {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${USER_TOKEN}`,
      },
      "body": JSON.stringify(body),
      "method": "POST"
    });
  
    const data = await response.json()
  
    return data;
  }
  
  async function runFlow(params, secretId) {
  
    const response = await fetch(`http://webhooks.example.com/hook/${params[0]}`, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json",
        "sec-ch-ua": "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "Referer": "http://web-ui.example.com/",
        "authorization": `Bearer ${USER_TOKEN}`,
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": JSON.stringify({...params[1], secretId}),
      "method": "POST"
    });
    
  
    const data = await response.json()
  
    console.log(data)
  
    return data;
  }

  module.exports = {
    processSlashCommand
  }