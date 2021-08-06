import { execFile } from 'child_process'

export function processFont(
  input: string
, output: string
, { format, subset }: {
    format: 'woff' | 'woff2'
    subset: string
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(
      'pyftsubset'
    , [
        input
      , `--text='${subset}'`
      , `--flavor=${format}`
      , `--output-file=${output}`
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
