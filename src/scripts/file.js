import fs from 'fs'
import path from 'path'

/**
 * 递归重命名文件夹中的所有文件
 * @param {string} dirPath - 文件夹路径
 * @param {string} searchPattern - 要搜索的字符串或正则表达式
 * @param {string} replaceWith - 替换成的字符串
 */
function renameFilesRecursively(dirPath, searchPattern, replaceWith) {
  try {
    // 检查路径是否存在
    if (!fs.existsSync(dirPath)) {
      console.error(`路径不存在: ${dirPath}`)
      return
    }

    // 读取目录内容
    const items = fs.readdirSync(dirPath)

    items.forEach((item) => {
      const fullPath = path.join(dirPath, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        // 如果是目录，先递归处理目录中的文件
        renameFilesRecursively(fullPath, searchPattern, replaceWith)

        // 然后重命名目录本身
        const newDirName = item.replace(searchPattern, replaceWith)
        if (newDirName !== item) {
          const newPath = path.join(dirPath, newDirName)
          try {
            fs.renameSync(fullPath, newPath)
            console.log(`目录已重命名: ${item} -> ${newDirName}`)
          } catch (error) {
            console.error(`重命名目录失败: ${item}`, error.message)
          }
        }
      } else if (stat.isFile()) {
        // 如果是文件，使用 replace 处理文件名
        const newFileName = item.replace(searchPattern, replaceWith)

        if (newFileName !== item) {
          const newPath = path.join(dirPath, newFileName)
          try {
            fs.renameSync(fullPath, newPath)
            console.log(`文件已重命名: ${item} -> ${newFileName}`)
          } catch (error) {
            console.error(`重命名文件失败: ${item}`, error.message)
          }
        }
      }
    })
  } catch (error) {
    console.error(`处理目录失败: ${dirPath}`, error.message)
  }
}

// 使用示例
// renameFilesRecursively('./test-folder', /\s+/g, '-')  // 将空格替换为横线
// renameFilesRecursively('./test-folder', 'old', 'new')  // 将 'old' 替换为 'new'

export { renameFilesRecursively }
