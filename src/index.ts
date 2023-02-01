import { go } from '@blackglory/prelude'
import * as Data from '@dao/data/database.js'
import { buildServer } from './server.js'
import { PORT, HOST, STORAGE, NODE_ENV, NodeEnv } from '@env/index.js'
import { ensureDirSync } from 'extra-filesystem'
import {
  getDerivedFontDirectory
, clearAllTemporaryDerivedFonts
} from '@api/derived-font.js'
import {
  getDerivedImageDirectory
, clearAllTemporaryDerivedImages
} from '@api/derived-image.js'
import { getStaticDirectory } from '@api/utils.js'
import { youDied } from 'you-died'

go(async () => {
  ensureDirSync(STORAGE())
  ensureDirSync(getStaticDirectory())
  ensureDirSync(getDerivedImageDirectory())
  ensureDirSync(getDerivedFontDirectory())

  await clearAllTemporaryDerivedFonts()
  await clearAllTemporaryDerivedImages()

  Data.openDatabase()
  youDied(() => Data.closeDatabase())
  await Data.prepareDatabase()

  const server = await buildServer()
  await server.listen({ port: PORT(), host: HOST() })
  if (NODE_ENV() === NodeEnv.Test) process.exit()

  process.send?.('ready')
})
