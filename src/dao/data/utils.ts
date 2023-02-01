import * as path from 'path'
import type { Database as IDatabase } from 'better-sqlite3'
import { getAppRoot } from '@src/utils.js'
import { findMigrationFilenames, readMigrationFile } from 'migration-files'
import { migrate } from '@blackglory/better-sqlite3-migrations'
import { map } from 'extra-promise'

export async function migrateDatabase(db: IDatabase): Promise<void> {
  const migrationsPath = path.join(getAppRoot(), 'migrations/data')
  const migrations = await map(
    await findMigrationFilenames(migrationsPath)
  , readMigrationFile
  )
  migrate(db, migrations)
}

export function enableForeignKeys(db: IDatabase): void {
  db.exec('PRAGMA foreign_keys = ON;')
}
