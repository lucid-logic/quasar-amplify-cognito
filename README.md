# Quasar Amplify Cognito Starter Project

A [Quasar](https://quasar.dev/) Project

## Install the dependencies

```bash
yarn
# or
npm install
```

## Add Amplify

amplify init
amplify add auth

Set redirects to ttp://localhost:8080/

Update AMplifyLogin.vue
`awsconfig.oauth.domain = "app.signin.example.com";`

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js).
