import { ValueGetter } from 'value-getter'
import { Getter } from 'justypes'
import { getCache } from '@env/cache.js'
import * as path from 'path'
import { getAppRoot } from '@src/utils.js'

export enum NodeEnv {
  Test
, Development
, Production
}

export const NODE_ENV: Getter<NodeEnv | undefined> =
  env('NODE_ENV')
    .convert(val => {
      switch (val) {
        case 'test': return NodeEnv.Test
        case 'development': return NodeEnv.Development
        case 'production': return NodeEnv.Production
      }
    })
    .memoize(getCache)
    .get()

export const HOST: Getter<string> =
  env('STATIC_HOST')
    .default('localhost')
    .memoize(getCache)
    .get()

export const PORT: Getter<number> =
  env('STATIC_PORT')
    .convert(toInteger)
    .default(8080)
    .memoize(getCache)
    .get()

export const DATABASE: Getter<string> =
  env('STATIC_DATABASE')
    .default(path.join(getAppRoot(), 'database'))
    .memoize(getCache)
    .get()

export const STORAGE: Getter<string> =
  env('STATIC_STORAGE')
    .default(path.join(getAppRoot(), 'storage'))
    .memoize(getCache)
    .get()

export const SECRET: Getter<string> =
  env('STATIC_SECRET')
    .required()
    .memoize(getCache)
    .get()

export const DISABLE_ACCESS_TO_ORIGINAL_IMAGES: Getter<boolean> =
  env('STATIC_DISABLE_ACCESS_TO_ORIGINAL_IMAGES')
    .convert(toBool)
    .default(false)
    .memoize(getCache)
    .get()

export const DISABLE_ACCESS_TO_ORIGINAL_FONTS: Getter<boolean> =
  env('STATIC_DISABLE_ACCESS_TO_ORIGINAL_FONTS')
    .convert(toBool)
    .default(false)
    .memoize(getCache)
    .get()

export const NOT_FOUND_CACHE_CONTROL: Getter<string> =
  env('STATIC_NOT_FOUND_CACHE_CONTROL')
    .default('private, no-cache, no-store, max-age=0, must-revalidate')
    .memoize(getCache)
    .get()

export const FOUND_CACHE_CONTROL: Getter<string> =
  env('STATIC_FOUND_CACHE_CONTROL')
    .default('public, max-age=31536000, immutable')
    .memoize(getCache)
    .get()

function env(name: string): ValueGetter<string | undefined> {
  return new ValueGetter(name, () => process.env[name])
}

function toBool(val: string | boolean | undefined): boolean | undefined {
  if (val) return val === 'true'
  return false
}

function toInteger(val: string | undefined ): number | undefined {
  if (val) return Number.parseInt(val, 10)
}
