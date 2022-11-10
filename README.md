# Simple chat (realtime) with reactjs and websocket to test OIH

To test some workflows with OIH

This chat includes a series of slash-commands that trigger OIH flows and receive the results of this flows in a callback that an ending component (not included here would call)

## Available commands

- /auth: triggers an auth flow
- /me: returns your profile data from MS graph api
- /run-flow <flow-id>: runs an specific OIH Flow id


## Development

```bash

# install yarn (in directory)
$ yarn install

# serve with hot reload at localhost:3000
$ yarn start_client

# build for production and launch server
$ USER_TOKEN=<mi_bearer_token> yarn start_server

# generate static project
$ yarn generate
```
