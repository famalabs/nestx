<div align="center">
  <h1>Auth-app (@famalabs/nestx)</h1>
</div>

<div align="center">
  <a href="https://github.com/famalabs/nestx/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" />
  </a>
  <a href="https://github.com/nestjs/nest">
    <img src="https://raw.githubusercontent.com/nestjsx/crud/master/img/nest-powered.svg?sanitize=true" alt="Nest Powered" />
  </a>
</div>

<div align="center">
  <sub>Built by
  <a href="https://github.com/famalabs">@Fama Labs</a> and
  <a href="https://github.com/famalabs/nestx/graphs/contributors">
    Contributors
  </a>
</div>

<br />

Sample app that wants to show you how to use [@famalabs/nestx-auth](https://github.com/famalabs/nestx/tree/master/packages/auth) package with MongoDB and Redis 

## Getting started

### Requirements
- NodeJs
- NPM
- MongoDB
- Redis

### Install
```shell
git clone https://github.com/famalabs/nestx.git
cd sample/nest-app
npm install
```
Once the dependencies are install, you have to create an .env file with the same structure of the env.sample file.
After that you are ready! :rocket:
```shell
npm run start
```

### Project structure
```shell
src/
├── common/  # BaseService and BaseModel for db
├── users
│   ├── models
|   |   └── user.model # Implements the IUser from @famalabs/nestx-auth
│   └── user.module.ts/  # The user module
├── app-auth/  
│    ├── app-auth.module # A global module that define some custom provider that are needed by the package
│    ├── auth-options # The config options for @famalabs/nestx-auth
│    ├── auth-users.service # Implements the IUserService from @famalabs/nestx-auth
│    └── notification-sender.service # Implements the INotificationSender from famalabs/nestx-auth
├── app.controller
├── app.service
├── app.module
└── main.ts
```

## Support

Any support is welcome. At least you can give us a star :star:

## Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].

## License

[MIT](LICENSE)
