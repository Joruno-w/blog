import path from 'path'
import { extractMdFilesFlat } from './file.js'

const sourcePath = path.resolve(
  import.meta.dirname,
  '../content/blog/nuxt-master'
)
const targetPath = path.resolve(import.meta.dirname, '../content/blog/Nuxt')

extractMdFilesFlat(sourcePath, targetPath, true, 'Nuxt', [
  'README*',
  'LICENSE*',
  'CHANGELOG*',
  '/^temp/',
])
