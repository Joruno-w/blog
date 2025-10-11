import path from 'path'
import { extractMdFilesFlat } from './file.js'

const sourcePath = path.resolve(
  import.meta.dirname,
  '../content/blog/frontend-new-react-master'
)
const targetPath = path.resolve(import.meta.dirname, '../content/blog/React')

extractMdFilesFlat(sourcePath, targetPath, true, 'React', [
  'README*',
  'LICENSE*',
  'CHANGELOG*',
  '/^temp/',
])
