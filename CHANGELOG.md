# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.3](https://github.com/BlackGlory/static/compare/v0.3.2...v0.3.3) (2023-02-01)

### [0.3.2](https://github.com/BlackGlory/static/compare/v0.3.1...v0.3.2) (2023-01-31)

### [0.3.1](https://github.com/BlackGlory/static/compare/v0.3.0...v0.3.1) (2023-01-29)

## [0.3.0](https://github.com/BlackGlory/static/compare/v0.2.11...v0.3.0) (2022-12-20)


### ⚠ BREAKING CHANGES

* - The `Accept-Version` header is semver now.
- Removed `/metrics`.
- Removed HTTP2 support.

* upgrade dependencies ([cfe512d](https://github.com/BlackGlory/static/commit/cfe512d6590cf69409477b0e001705a1bbe425de))

### [0.2.11](https://github.com/BlackGlory/static/compare/v0.2.10...v0.2.11) (2022-09-07)

### [0.2.10](https://github.com/BlackGlory/static/compare/v0.2.9...v0.2.10) (2022-08-11)

### [0.2.9](https://github.com/BlackGlory/static/compare/v0.2.8...v0.2.9) (2022-07-29)


### Features

* add microcaches ([7dc1516](https://github.com/BlackGlory/static/commit/7dc151627d0567bbd2cc810f4f1033a3c751cece))

### [0.2.8](https://github.com/BlackGlory/static/compare/v0.2.7...v0.2.8) (2022-07-27)

### [0.2.7](https://github.com/BlackGlory/static/compare/v0.2.6...v0.2.7) (2022-04-16)

### [0.2.6](https://github.com/BlackGlory/static/compare/v0.2.5...v0.2.6) (2022-02-16)

### [0.2.5](https://github.com/BlackGlory/static/compare/v0.2.4...v0.2.5) (2022-02-13)


### Features

* improve mime type sniffing ([b718a0f](https://github.com/BlackGlory/static/commit/b718a0f8ae673711eb685e521d86c28e8e60fd03))

### [0.2.4](https://github.com/BlackGlory/static/compare/v0.2.3...v0.2.4) (2022-02-13)


### Features

* add contentType support ([12070c5](https://github.com/BlackGlory/static/commit/12070c5af88796dde0d48c5f3d3deeeaf067385e))
* get mime types from filenames ([750d36a](https://github.com/BlackGlory/static/commit/750d36ac88ff395390421778ee601df78e567b80))
* improve query checker ([6865f54](https://github.com/BlackGlory/static/commit/6865f54a81c9f801af0b8eaab380d0fa47679758))

### [0.2.3](https://github.com/BlackGlory/static/compare/v0.2.2...v0.2.3) (2022-01-16)


### Features

* add accept-version support ([4b5e450](https://github.com/BlackGlory/static/commit/4b5e450468b6cfde8b243c6d16aa4a3307b61e41))
* add default cache-control header ([4daff3b](https://github.com/BlackGlory/static/commit/4daff3bbbad977963fb23ce394314fa7d1ab2f23))
* clear all temp files when the server starts ([513071f](https://github.com/BlackGlory/static/commit/513071f45d4e2fae8d0d80bbc726d9df0ad0cd9c))
* improve processing, always write temp files first ([9904d95](https://github.com/BlackGlory/static/commit/9904d9527568920fe8ad558998af13060098d822))


### Bug Fixes

* ensure derived-fonts folder ([b959326](https://github.com/BlackGlory/static/commit/b9593262bf3d2c430f44254c5c1f1bff84653af0))
* **docker:** healthcheck ([1141a31](https://github.com/BlackGlory/static/commit/1141a31e0fa98cea4785ed555ea399a0226c3ba3))
* **docker:** healthcheck ([9d95173](https://github.com/BlackGlory/static/commit/9d95173f4376a82d0c5420a5380530904213d058))

### [0.2.2](https://github.com/BlackGlory/static/compare/v0.2.1...v0.2.2) (2021-10-14)

### [0.2.1](https://github.com/BlackGlory/static/compare/v0.2.0...v0.2.1) (2021-10-12)


### Features

* add environment variables DISABLE_ACCESS_TO_ORIGINAL_IMAGES, DISABLE_ACCESS_TO_ORIGINAL_FONTS ([8d25cb8](https://github.com/BlackGlory/static/commit/8d25cb83431232b744f7030fca60c6684392ec8b))
* font processing ([56e9b0c](https://github.com/BlackGlory/static/commit/56e9b0c5a317642d805e481ed885aefb7765d4c6))


### Bug Fixes

* dockerfile ([8149935](https://github.com/BlackGlory/static/commit/81499355ea630f650a7f13f084079f0cfba7f157))
* ensureDerivedImage ([856a57d](https://github.com/BlackGlory/static/commit/856a57d48ae895e0887d966c2bfd61d7a2bdf0d3))
* environment variable names ([d8545f9](https://github.com/BlackGlory/static/commit/d8545f9442b3c5ae0359a81e1bb4151279822d6b))

## [0.2.0](https://github.com/BlackGlory/static/compare/v0.1.1...v0.2.0) (2021-07-29)


### ⚠ BREAKING CHANGES

* - Replace `STATIC_DATA` with `STATIC_DATABASE`, `STATIC_STORAGE`
- New environment variable `STATIC_SECRET` is required

### Features

* improve image processing ([77b6ca4](https://github.com/BlackGlory/static/commit/77b6ca42a4f4a61cc5f19ca05e27e1e863505465))
* support detecting file type ([bb92443](https://github.com/BlackGlory/static/commit/bb92443739d1a48108064d314b8d3bb71f286e1f))
* support image processing ([a19e92e](https://github.com/BlackGlory/static/commit/a19e92ea7cf1b91df5435f3a8af81b503701640a))


* update ([51f2cef](https://github.com/BlackGlory/static/commit/51f2cef65f128a7da4a0965ddf99cd7173f79b18))

### 0.1.1 (2021-07-12)


### Features

* init ([be61e78](https://github.com/BlackGlory/static/commit/be61e7813ee266cb4fb7035b96b94eecd961391f))
