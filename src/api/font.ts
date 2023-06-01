import { run } from 'extra-exec'

export async function processFont(
  inputFilename: string
, outputFilename: string
, { format, subset }: {
    format: 'woff' | 'woff2'
    subset: string
  }
): Promise<void> {
  await run(
    'pyftsubset'
  , [
      inputFilename
    , `--text=${subset}`
    , `--flavor=${format}`
    , `--output-file=${outputFilename}`
    ]
  )
}
