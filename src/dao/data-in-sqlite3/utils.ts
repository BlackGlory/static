import * as path from 'path'
import type { Database as IDatabase } from 'better-sqlite3'
import { path as appRoot } from 'app-root-path'
import { readMigrations } from 'migrations-file'
import { migrate } from '@blackglory/better-sqlite3-migrations'

export async function migrateDatabase(db: IDatabase) {
  const migrationsPath = path.join(appRoot, 'migrations/data-in-sqlite3')
  const migrations = await readMigrations(migrationsPath)
  migrate(db, migrations)
}

export function enableForeignKeys(db: IDatabase): void {
  db.exec('PRAGMA foreign_keys = ON;')
}
