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

// extractMdFilesFlat('./source-folder', './extracted-md-files')  // 提取 .md 文件并转换为 .mdx
// extractMdFilesFlat('./docs', './all-docs', true, 'AI编码提效', ['README*', 'LICENSE*', '/^temp/'])  // 提取并覆盖同名文件，指定分类和黑名单
/**
 * 递归提取文件夹中的 .md 文件并扁平化存放到目标文件夹
 * 同时添加 frontmatter 并转换为 .mdx 格式
 * @param {string} sourcePath - 源文件夹路径
 * @param {string} targetPath - 目标文件夹路径
 * @param {boolean} overwrite - 是否覆盖同名文件，默认为 false
 * @param {string} category - 可选的分类名称，默认为空
 * @param {Array<string>} blacklist - 黑名单数组，支持通配符和正则表达式，默认为空数组
 */
function extractMdFilesFlat(
  sourcePath,
  targetPath,
  overwrite = false,
  category = '',
  blacklist = []
) {
  try {
    // 检查源路径是否存在
    if (!fs.existsSync(sourcePath)) {
      console.error(`源路径不存在: ${sourcePath}`)
      return
    }

    // 确保目标文件夹存在
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true })
      console.log(`已创建目标文件夹: ${targetPath}`)
    }
    // 用于记录已处理的文件名，避免重复
    const processedFiles = new Set()
    let totalCopied = 0
    let sequenceNumber = 1

    // 获取今天的日期（YYYY-MM-DD 格式）
    const today = new Date().toISOString().split('T')[0]

    // 黑名单匹配函数
    function isInBlacklist(fileName) {
      return blacklist.some((pattern) => {
        try {
          // 尝试作为正则表达式处理
          if (pattern.startsWith('/') && pattern.endsWith('/')) {
            const regexPattern = pattern.slice(1, -1)
            const regex = new RegExp(regexPattern, 'i')
            return regex.test(fileName)
          }
          // 处理通配符模式
          const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.')
          const regex = new RegExp(`^${regexPattern}$`, 'i')
          return regex.test(fileName)
        } catch (error) {
          console.warn(`黑名单模式无效: ${pattern}`, error.message)
          return false
        }
      })
    }

    // 创建 frontmatter 的辅助函数
    function createFrontmatter(title, pubDate, category) {
      let frontmatter = `---
title: ${title}
description: ${title}
pubDate: ${pubDate}
toc: true
ogImage: true`

      if (category) {
        frontmatter += `\ncategory: ${category}`
      }

      frontmatter += '\n---'
      return frontmatter
    }

    function traverseDirectory(currentPath) {
      // 检查当前目录是否包含 package.json 文件
      const packageJsonPath = path.join(currentPath, 'package.json')
      if (fs.existsSync(packageJsonPath)) {
        console.log(`跳过包含 package.json 的目录: ${currentPath}`)
        return
      }

      const items = fs.readdirSync(currentPath)

      items.forEach((item) => {
        const fullPath = path.join(currentPath, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          // 递归处理子目录
          traverseDirectory(fullPath)
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase()

          if (ext === '.md') {
            // 检查文件名是否在黑名单中
            const nameWithoutExt = path
              .parse(item)
              .name.replace(/\d+(\.|-)?\s*/g, '')

            if (isInBlacklist(nameWithoutExt) || isInBlacklist(item)) {
              console.log(`跳过黑名单文件: ${item}`)
              return
            }

            // 处理 .md 文件
            console.log(`发现 .md 文件: ${item}`)
            let targetFileName = `${sequenceNumber}-${nameWithoutExt}.mdx`
            let counter = 1

            // 处理同名文件
            while (processedFiles.has(targetFileName)) {
              targetFileName = `${sequenceNumber}-${nameWithoutExt}_${counter}.mdx`
              counter++
            }

            const targetFilePath = path.join(targetPath, targetFileName)

            // 如果源文件和目标文件扩展名相同且路径相同，跳过（避免无限循环）
            if (
              fullPath === targetFilePath &&
              path.extname(fullPath) === '.mdx'
            ) {
              console.log(`跳过已转换的 .mdx 文件: ${item}`)
              return
            }

            // 检查目标文件是否已存在
            if (fs.existsSync(targetFilePath) && !overwrite) {
              console.warn(`文件已存在，跳过: ${targetFileName}`)
              return
            }

            try {
              // 读取原文件内容
              const originalContent = fs.readFileSync(fullPath, 'utf8')

              // 去除与文件名相同的第一个一级标题
              let processedContent = originalContent
              const firstH1Match = originalContent.match(/^#\s+(.+)$/m)
              if (firstH1Match && firstH1Match[1].trim() === nameWithoutExt) {
                // 找到匹配的一级标题，将其删除
                processedContent = originalContent
                  .replace(/^#\s+.+$/m, '')
                  .trim()
                console.log(`已删除重复的一级标题: ${firstH1Match[1]}`)
              }

              // 检查是否已经有 frontmatter
              const hasFrontmatter = processedContent.startsWith('---')

              let newContent
              if (hasFrontmatter) {
                // 如果已有 frontmatter，替换或更新
                const frontmatterEndIndex = processedContent.indexOf('---', 3)
                if (frontmatterEndIndex !== -1) {
                  const existingFrontmatter = processedContent.substring(
                    0,
                    frontmatterEndIndex + 3
                  )
                  const bodyContent = processedContent.substring(
                    frontmatterEndIndex + 3
                  )

                  // 更新 frontmatter 中的字段
                  let updatedFrontmatter = existingFrontmatter
                    .replace(/title:\s*.*$/m, `title: ${nameWithoutExt}`)
                    .replace(
                      /description:\s*.*$/m,
                      `description: ${nameWithoutExt}`
                    )
                    .replace(/pubDate:\s*.*$/m, `pubDate: ${today}`)

                  // 如果没有找到这些字段，添加它们
                  if (!updatedFrontmatter.includes('title:')) {
                    updatedFrontmatter = updatedFrontmatter.replace(
                      '---',
                      `---\ntitle: ${nameWithoutExt}`
                    )
                  }
                  if (!updatedFrontmatter.includes('description:')) {
                    updatedFrontmatter = updatedFrontmatter.replace(
                      '---',
                      `---\ndescription: ${nameWithoutExt}`
                    )
                  }
                  if (!updatedFrontmatter.includes('pubDate:')) {
                    updatedFrontmatter = updatedFrontmatter.replace(
                      '---',
                      `---\npubDate: ${today}`
                    )
                  }

                  newContent = updatedFrontmatter + bodyContent
                } else {
                  // frontmatter 格式不正确，重新创建
                  newContent =
                    createFrontmatter(nameWithoutExt, today, category) +
                    '\n' +
                    processedContent
                }
              } else {
                // 没有 frontmatter，添加新的
                newContent =
                  createFrontmatter(nameWithoutExt, today, category) +
                  '\n' +
                  processedContent
              }
              // 写入新文件
              fs.writeFileSync(targetFilePath, newContent, 'utf8')
              processedFiles.add(targetFileName)
              totalCopied++
              sequenceNumber++
              console.log(`已转换: ${fullPath} -> ${targetFilePath}`)
            } catch (error) {
              console.error(`处理文件失败: ${item}`, error.message)
            }
          }
        }
      })
    }

    traverseDirectory(sourcePath)
    console.log(`\n提取完成！共转换了 ${totalCopied} 个 .md 文件为 .mdx 格式`)
    console.log(
      `使用的黑名单模式: ${blacklist.length > 0 ? blacklist.join(', ') : '无'}`
    )
  } catch (error) {
    console.error(`提取过程中发生错误:`, error.message)
  }
}
const sourcePath = path.resolve(
  import.meta.dirname,
  '../content/blog/ReactNative'
)
const targetPath = path.resolve(import.meta.dirname, '../content/blog/RN')

extractMdFilesFlat(sourcePath, targetPath, true, 'React Native', [
  'README*',
  'LICENSE*',
  'CHANGELOG*',
  '/^temp/',
])

export { renameFilesRecursively, extractMdFilesFlat }
