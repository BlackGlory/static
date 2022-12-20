import Database from 'better-sqlite3'
import type { Database as IDatabase } from 'better-sqlite3'
import * as path from 'path'
import { ensureDirSync } from 'extra-filesystem'
import { DATABASE, NODE_ENV, NodeEnv } from '@env/index.js'
import { assert } from '@blackglory/errors'
import { enableForeignKeys, migrateDatabase } from './utils.js'

let db: IDatabase | undefined

export function openDatabase(): void {
  switch (NODE_ENV()) {
    case NodeEnv.Test: {
      db = new Database(':memory:')
      break
    }
    default: {
      const dataPath = DATABASE()
      const dataFilename = path.join(dataPath, 'data.db')
      ensureDirSync(dataPath)

      db = new Database(dataFilename)
    }
  }
}

export async function prepareDatabase(): Promise<void> {
  assert(db, 'db must be defined')

  enableForeignKeys(db)
  await migrateDatabase(db)
}

export function getDatabase(): IDatabase {
  assert(db, 'db must be defined')

  return db
}

export function closeDatabase(): void {
  if (db) {
    db.exec(`
      PRAGMA analysis_limit=400;
      PRAGMA optimize;
    `)
    db.close()
  }
}
