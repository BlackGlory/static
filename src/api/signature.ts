import * as crypto from 'crypto'
import { SECRET } from '@env/index.js'

export function validateSignature(
  signature: string
, params: Record<string, unknown>
): boolean {
  return computeSignature(params) === signature
}

export function computeSignature(params: Record<string, unknown>): string {
  const urlSearchParams = new URLSearchParams(stringifyRecord(params))
  urlSearchParams.sort()
  const text = urlSearchParams.toString()
  return hmacSHA256(SECRET(), text)
}

function hmacSHA256(secret: string, text: string): string {
  return crypto.createHmac('sha256', secret)
    .update(text)
    .digest()
    .toString('hex')
}

function stringifyRecord(record: Record<string, unknown>): Record<string, string> {
  const entries = Object
    .entries(record)
    .map(([key, value]) => [key, `${value}`] as const)

  return Object.fromEntries(entries)
}
