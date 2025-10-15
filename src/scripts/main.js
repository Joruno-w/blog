import path from 'path'
import { extractMdFilesFlat } from './file.js'

const sourcePath = path.resolve(
  import.meta.dirname,
  '../content/blog/browser-plugin-main'
)
const targetPath = path.resolve(
  import.meta.dirname,
  '../content/blog/浏览器插件'
)

extractMdFilesFlat(sourcePath, targetPath, true, '浏览器插件', [
  'README*',
  'LICENSE*',
  'CHANGELOG*',
  '/^temp/',
])
