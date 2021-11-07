import { execFile } from 'child_process'

export function processFont(
  inputFilename: string
, outputFilename: string
, { format, subset }: {
    format: 'woff' | 'woff2'
    subset: string
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(
      'pyftsubset'
    , [
        inputFilename
      , `--text='${subset}'`
      , `--flavor=${format}`
      , `--output-file=${outputFilename}`
      ]
    , (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr))
      } else {
        resolve()
      }
    })
  })
}
