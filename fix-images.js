import fs from 'fs'
import path from 'path'

/**
 * 移动图片并更新 MDX 文件中的图片路径
 */
function fixImagePaths() {
  const sourceDir = 'src/content/blog/nestjs-main'
  const targetDir = 'img'
  const mdxDir = 'src/content/blog/Nest'

  // 确保目标目录存在
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  // 收集所有图片文件
  const imageFiles = []

  function collectImages(dir) {
    const items = fs.readdirSync(dir)

    items.forEach((item) => {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        collectImages(fullPath)
      } else if (path.extname(item).toLowerCase() === '.png') {
        imageFiles.push({
          sourcePath: fullPath,
          fileName: item,
          relativePath: path.relative(sourceDir, fullPath),
        })
      }
    })
  }

  console.log('正在收集图片文件...')
  collectImages(sourceDir)
  console.log(`找到 ${imageFiles.length} 个图片文件`)

  // 移动图片文件
  const movedImages = new Map() // 原路径 -> 新文件名
  let moveCount = 0

  imageFiles.forEach(({ sourcePath, fileName, relativePath }) => {
    // 生成唯一的文件名（避免重名）
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    const ext = path.extname(fileName)
    const baseName = path.basename(fileName, ext)
    const newFileName = `nestjs-${timestamp}-${random}-${baseName}${ext}`

    const targetPath = path.join(targetDir, newFileName)

    try {
      // 复制文件
      fs.copyFileSync(sourcePath, targetPath)
      movedImages.set(relativePath, newFileName)
      moveCount++

      if (moveCount % 50 === 0) {
        console.log(`已移动 ${moveCount} 个文件...`)
      }
    } catch (error) {
      console.error(`移动文件失败: ${sourcePath}`, error.message)
    }
  })

  console.log(`成功移动 ${moveCount} 个图片文件到 ${targetDir}`)

  // 更新 MDX 文件中的图片路径
  if (!fs.existsSync(mdxDir)) {
    console.log(`MDX 目录不存在: ${mdxDir}`)
    return
  }

  const mdxFiles = fs
    .readdirSync(mdxDir)
    .filter((file) => file.endsWith('.mdx'))
  let updatedFiles = 0

  mdxFiles.forEach((mdxFile) => {
    const mdxPath = path.join(mdxDir, mdxFile)
    let content = fs.readFileSync(mdxPath, 'utf8')
    let hasChanges = false

    // 查找并替换图片路径
    const imageRegex = /!\[([^\]]*)\]\(\.\/assets\/([^)]+\.png)\)/g

    content = content.replace(imageRegex, (match, alt, imageName) => {
      // 在移动的图片中查找对应的文件
      for (const [originalPath, newFileName] of movedImages.entries()) {
        if (originalPath.includes(imageName)) {
          hasChanges = true
          return `![${alt}](/img/${newFileName})`
        }
      }

      // 如果没找到对应的图片，保持原样但输出警告
      console.warn(`未找到图片: ${imageName} in ${mdxFile}`)
      return match
    })

    // 如果有变化，写回文件
    if (hasChanges) {
      fs.writeFileSync(mdxPath, content, 'utf8')
      updatedFiles++
      console.log(`已更新: ${mdxFile}`)
    }
  })

  console.log(`\n处理完成！`)
  console.log(`- 移动图片: ${moveCount} 个`)
  console.log(`- 更新 MDX 文件: ${updatedFiles} 个`)

  // 生成清理脚本
  const cleanupScript = `#!/bin/bash
# 清理原始图片文件
echo "正在清理原始图片文件..."
find src/content/blog/nestjs-main -name "*.png" -delete
echo "清理完成！"
`

  fs.writeFileSync('cleanup-images.sh', cleanupScript)
  console.log('已生成清理脚本: cleanup-images.sh')
  console.log(
    '运行 chmod +x cleanup-images.sh && ./cleanup-images.sh 来清理原始图片'
  )
}

// 运行脚本
fixImagePaths()
