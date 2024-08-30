# Static
A static file server inspired by [Serve].

The service considers static files to be immutable by default,
you can set environment varaible `STATIC_FOUND_CACHE_CONTROL` to change it.

[Serve]: https://github.com/vercel/serve

## Install
The environment variables `STATIC_HOST` and `STATIC_PORT` can be used to set the address and port that the server listens to.
The default values are `localhost` and `8080`.

```sh
git clone https://github.com/BlackGlory/static
cd static
pip install --requirement requirements.txt
npm install
npm run build
npm run bundle
npm start
```

### Docker
```sh
docker run \
  --detach \
  --publish 8080:8080 \
  blackglory/static
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  static:
    image: 'blackglory/static'
    restart: always
    environment:
      - 'STATIC_SECRET=secret'
    volumes:
      - 'static-database:/database'
      - 'static-storage:/storage'
    ports:
      - '8080:8080'

volumes:
  static-database:
  static-storage:
```

## API
### Public
#### get file
`GET /files/:location`

Return the file relative environment `STATIC_STORAGE/files` directory.

## Cache
### `STATIC_NOT_FOUND_CACHE_CONTROL`
This environment variable is the response header `Cache-Control` when the file is not found.
Default: `private, no-cache, no-store, max-age=0, must-revalidate`

### `STATIC_FOUND_CACHE_CONTROL`
This environment variable is the response header `Cache-Control` when the file is found.
Default: `public, max-age=31536000, immutable`

## Content-Type
The mime types of files are determined by file extensions,
if fails, try to get mime types from file data.

Requests can specify a contentType in querystring,
which allows skip the above steps:
```ts
{
  contentType?: string
}
```

## Image processing
Static support image processing, so that users can create responsive images.

The image processing feature works through querystring:
```ts
{
  signature: string
  format: 'jpeg' | 'webp'
  quality: integer // 1-100
  maxWidth?: integer
  maxHeight?: integer
  multiple?: float
  contentType?: string
}
```

The derived images will be cached in `STATIC_STORAGE/derived-images`.

You can disable direct access to images with `STATIC_DISABLE_ACCESS_TO_ORIGINAL_IMAGES=true`.

## Font processing
Static support font processing, so that users can create subsets of fonts.

The font processing feature works throught querystring:
```ts
{
  signature: string
  format: 'woff' | 'woff2'
  subset: string
  contentType?: string
}
```

The derived fonts will be cached in `STATIC_STORAGE/derived-fonts`.

You can disable direct access to fonts with `STATIC_DISABLE_ACCESS_TO_ORIGINAL_FONTS=true`.

## Signature
Only users with the `STATIC_SECRET` can create a signature.

Create a signature:
```ts
const urlSearchParams = new URLSearchParams(params)
urlSearchParams.sort()
const signature = hmacSHA256(secret, urlSearchParams.toString())
```
