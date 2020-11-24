<div align="center">
  <h1>Nestx</h1>
</div>
<div align="center">
  <strong>for APIs built with NestJs</strong>
</div>

<br />

<div align="center">
  <a href="https://github.com/famalabs/nestx/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License MIT" />
  </a>
  <a href="https://github.com/nestjs/nest">
    <img src="https://raw.githubusercontent.com/nestjsx/crud/master/img/nest-powered.svg?sanitize=true" alt="Nest Powered" />
  </a>
   <a href="https://lerna.js.org/">
    <img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg" alt="Maintained with Lerna" />
  </a>
    <a href="http://gulpjs.com/">
    <img src="http://img.shields.io/badge/built%20with-gulp.js-red.svg" alt="Built with Gulp" />
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

Collection of Nestjs extension libraries.

## Features

- :dart: Core package

- :lock: Auth package

- :pencil2: Swagger documentation

## Packages

- [**@famalabs/nestx-core**](https://www.npmjs.com/package/@famalabs/nestx-core) - core package which provides utilities ([docs](https://github.com/famalabs/nestx/tree/master/packages/core))
- [**@famalabs/nestx-auth**](https://www.npmjs.com/package/@famalabs/nestx-auth) - auth package which provides an auth module with 3rd-party logins, access/refresh token operations and ACL ([docs](https://github.com/famalabs/nestx/tree/master/packages/auth))

## Get Started

To get started, you need to:

1. Clone the repository

```shell
git clone https://github.com/famalabs/nestx.git <project_name>
```

2. Install dependencies

```
cd <project_name>
npm install
```

Note: There are a `postinstall` and `prepare` scripts that run after `npm install` has finished.
The `postinstall` script will bootstrap and hoisting dependencies in the monorepo.
The `prepare` script will build all packages after first install and before versioning or publishing.

## Support

Any support is welcome. At least you can give us a star :star:

## Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].

## License

[MIT](LICENSE)
