import path from 'path'
import { extractMdFilesFlat } from './file.js'

const sourcePath = path.resolve(
  import.meta.dirname,
  '../content/blog/nestjs-main'
)
const targetPath = path.resolve(import.meta.dirname, '../content/blog/Nest')

extractMdFilesFlat(sourcePath, targetPath, true, 'Nest', [
  'README*',
  'LICENSE*',
  'CHANGELOG*',
  '/^temp/',
])
