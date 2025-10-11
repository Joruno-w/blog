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
/**
 * 检查文件名是否在黑名单中
 * @param {string} fileName - 文件名
 * @param {Array<string>} blacklist - 黑名单数组
 * @returns {boolean} 是否在黑名单中
 */
function isInBlacklist(fileName, blacklist) {
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

/**
 * 创建 frontmatter
 * @param {string} title - 标题
 * @param {string} pubDate - 发布日期
 * @param {string} category - 分类
 * @returns {string} frontmatter 字符串
 */
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

/**
 * 处理文件内容，去除重复的一级标题
 * @param {string} content - 原始内容
 * @param {string} fileName - 文件名（不含扩展名）
 * @returns {string} 处理后的内容
 */
function processContentTitle(content, fileName) {
  const firstH1Match = content.match(/^#\s+(.+)$/m)
  if (firstH1Match && firstH1Match[1].trim() === fileName) {
    console.log(`已删除重复的一级标题: ${firstH1Match[1]}`)
    return content.replace(/^#\s+.+$/m, '').trim()
  }
  return content
}

/**
 * 更新或创建 frontmatter
 * @param {string} content - 文件内容
 * @param {string} title - 标题
 * @param {string} today - 今天日期
 * @param {string} category - 分类
 * @returns {string} 更新后的内容
 */
function updateFrontmatter(content, title, today, category) {
  const hasFrontmatter = content.startsWith('---')

  if (hasFrontmatter) {
    const frontmatterEndIndex = content.indexOf('---', 3)
    if (frontmatterEndIndex !== -1) {
      const existingFrontmatter = content.substring(0, frontmatterEndIndex + 3)
      const bodyContent = content.substring(frontmatterEndIndex + 3)

      // 更新 frontmatter 中的字段
      let updatedFrontmatter = existingFrontmatter
        .replace(/title:\s*.*$/m, `title: ${title}`)
        .replace(/description:\s*.*$/m, `description: ${title}`)
        .replace(/pubDate:\s*.*$/m, `pubDate: ${today}`)

      // 如果没有找到这些字段，添加它们
      if (!updatedFrontmatter.includes('title:')) {
        updatedFrontmatter = updatedFrontmatter.replace(
          '---',
          `---\ntitle: ${title}`
        )
      }
      if (!updatedFrontmatter.includes('description:')) {
        updatedFrontmatter = updatedFrontmatter.replace(
          '---',
          `---\ndescription: ${title}`
        )
      }
      if (!updatedFrontmatter.includes('pubDate:')) {
        updatedFrontmatter = updatedFrontmatter.replace(
          '---',
          `---\npubDate: ${today}`
        )
      }

      return updatedFrontmatter + bodyContent
    } else {
      // frontmatter 格式不正确，重新创建
      return createFrontmatter(title, today, category) + '\n' + content
    }
  } else {
    // 没有 frontmatter，添加新的
    return createFrontmatter(title, today, category) + '\n' + content
  }
}

/**
 * 处理单个 Markdown 文件
 * @param {string} filePath - 文件路径
 * @param {string} fileName - 文件名
 * @param {string} targetPath - 目标路径
 * @param {number} sequenceNumber - 序号
 * @param {string} today - 今天日期
 * @param {string} category - 分类
 * @returns {boolean} 是否处理成功
 */
function processMdFile(
  filePath,
  fileName,
  targetPath,
  sequenceNumber,
  today,
  category
) {
  try {
    // 读取原文件内容
    const originalContent = fs.readFileSync(filePath, 'utf8')

    // 去除与文件名相同的第一个一级标题
    const processedContent = processContentTitle(originalContent, fileName)

    // 更新或创建 frontmatter
    const newContent = updateFrontmatter(
      processedContent,
      fileName,
      today,
      category
    )

    // 生成目标文件路径
    const targetFileName = `${sequenceNumber}-${fileName}.mdx`
    const targetFilePath = path.join(targetPath, targetFileName)

    // 写入新文件
    fs.writeFileSync(targetFilePath, newContent, 'utf8')
    console.log(`已转换: ${filePath} -> ${targetFilePath}`)
    return true
  } catch (error) {
    console.error(`处理文件失败: ${fileName}`, error.message)
    return false
  }
}

/**
 * 处理重复文件名
 * @param {string} fileName - 文件名
 * @param {Map} processedFiles - 已处理文件映射
 * @param {string} targetPath - 目标路径
 * @param {number} currentSequenceNumber - 当前序号
 * @returns {Object} 包含是否为重复文件和计数变化的对象
 */
function handleDuplicateFile(
  fileName,
  processedFiles,
  targetPath,
  currentSequenceNumber
) {
  if (processedFiles.has(fileName)) {
    const oldSequenceNumber = processedFiles.get(fileName)
    const oldFileName = `${oldSequenceNumber}-${fileName}.mdx`
    const oldFilePath = path.join(targetPath, oldFileName)

    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath)
      console.log(`删除重复文件: ${oldFileName}`)
      return { isDuplicate: true, countChange: -1 }
    }
    return { isDuplicate: true, countChange: 0 }
  }

  processedFiles.set(fileName, currentSequenceNumber)
  return { isDuplicate: false, countChange: 0 }
}

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
    // 用于记录已处理的文件名和对应的序号，避免重复
    const processedFiles = new Map() // 存储 fileName -> sequenceNumber 的映射
    let totalCopied = 0
    let sequenceNumber = 1

    // 获取今天的日期（YYYY-MM-DD 格式）
    const today = new Date().toISOString().split('T')[0]

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

            if (
              isInBlacklist(nameWithoutExt, blacklist) ||
              isInBlacklist(item, blacklist)
            ) {
              console.log(`跳过黑名单文件: ${item}`)
              return
            }
            // 处理 .md 文件
            console.log(`发现 .md 文件: ${item}`)
            // 检查是否已经处理过相同的文件名
            let currentSequenceNumber = sequenceNumber
            const duplicateResult = handleDuplicateFile(
              nameWithoutExt,
              processedFiles,
              targetPath,
              currentSequenceNumber
            )

            if (duplicateResult.isDuplicate) {
              currentSequenceNumber = processedFiles.get(nameWithoutExt)
            } else {
              sequenceNumber++
            }

            totalCopied += duplicateResult.countChange

            const targetFileName = `${currentSequenceNumber}-${nameWithoutExt}.mdx`
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
            // 处理文件
            if (
              processMdFile(
                fullPath,
                nameWithoutExt,
                targetPath,
                currentSequenceNumber,
                today,
                category
              )
            ) {
              totalCopied++
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

export { extractMdFilesFlat, renameFilesRecursively }
