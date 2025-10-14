#!/bin/bash
# 清理原始图片文件
echo "正在清理原始图片文件..."
find src/content/blog/nestjs-main -name "*.png" -delete
echo "清理完成！"
