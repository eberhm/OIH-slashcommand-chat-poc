const fetch = require('node-fetch');

const USER_TOKEN = process.env.USER_TOKEN;

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
    case '/me':
        return runFlow(['636bc7d038eb81e80bc6cec2', ...params], secretId)
        break;
      default:
        console.log('command not recognized ' + command)
        return 'command not recognized ' + command
        break;
    }
  }
  
  async function startAuthRequest(params) {
  
    const body = {
      "scope": params[0] || "User.Read",
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
  
    console.log('running flow with:', { params, secretId });

    const response = await fetch(`http://webhooks.example.com/hook/${params[0]}`, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json",
        "authorization": `Bearer ${USER_TOKEN}`
      },
      "body": JSON.stringify({params: params.splice(1), secretId}),
      "method": "POST"
    });
    
  
    const data = await response.json()
  
    console.log(data)
  
    return data;
  }

  module.exports = {
    processSlashCommand
  }