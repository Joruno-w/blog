import path from 'path'
import { extractMdFilesFlat } from './file.js'

const sourcePath = path.resolve(
  import.meta.dirname,
  '../content/blog/doc-collaboration-master'
)
const targetPath = path.resolve(import.meta.dirname, '../content/blog/文档协同')

extractMdFilesFlat(sourcePath, targetPath, true, '文档协同', [
  'README*',
  'LICENSE*',
  'CHANGELOG*',
  '/^temp/',
])
