import { go } from '@blackglory/go'
import * as DataInSqlite3 from '@dao/data-in-sqlite3/database'
import { buildServer } from './server'
import { PORT, HOST, STORAGE, NODE_ENV, NodeEnv } from '@env'
import { ensureDirSync } from 'extra-filesystem'
import {
  getDerivedFontDirectory
, clearAllTemporaryDerivedFonts
} from '@core/derived-font'
import {
  getDerivedImageDirectory
, clearAllTemporaryDerivedImages
} from '@core/derived-image'
import { getStaticDirectory } from '@core/utils'
import { youDied } from 'you-died'

go(async () => {
  ensureDirSync(STORAGE())
  ensureDirSync(getStaticDirectory())
  ensureDirSync(getDerivedImageDirectory())
  ensureDirSync(getDerivedFontDirectory())

  await clearAllTemporaryDerivedFonts()
  await clearAllTemporaryDerivedImages()

  DataInSqlite3.openDatabase()
  youDied(() => DataInSqlite3.closeDatabase())
  await DataInSqlite3.prepareDatabase()

  const server = await buildServer()
  await server.listen(PORT(), HOST())
  if (NODE_ENV() === NodeEnv.Test) process.exit()

  process.send?.('ready')
})
