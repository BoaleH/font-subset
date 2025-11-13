# 字体子集化自动化工具，抽离特定字符字体，去除无用字符字体，减小字体文件的大小，提升页面加载速度

## 功能特性

- 📁 批量处理字体文件目录
- 🔤 基于指定字符文件进行精确子集化
- 🎯 自动输出 TTF、WOFF2 格式
- 📊 生成详细的压缩报告
- 🔄 支持 TTF、OTF、WOFF 输入格式

## 项目结构

```
font-subset-automation/
├── fonts/
│   ├── source/          # 原始字体文件
│   └── output/          # 子集化后文件
├── charset.txt          # 需要保留的字符集
├── font-subset.js       # 核心处理脚本
├── index.html           # 子集化后的字体文件效果预览，需转化后自行修改字体文件路径
├── package.json         # 项目配置
└── README.md            # 说明文档
```

## 快速开始

1. **安装依赖**

   ```bash
   npm install
   ```

2. **准备文件**

   - 将需要子集化的字体文件放入 `fonts/source/` 目录
   - 在 `charset.txt` 中指定需要保留的字符

3. **执行处理**
   ```bash
   npm run subset
   ```

## 配置说明

修改 `font-subset.js` 中的配置对象：

```javascript
const processor = new FontSubsetProcessor({
  sourceDir: "./fonts/source", // 源字体目录
  targetDir: "./fonts/output", // 输出目录
  charFile: "./charset.txt", // 字符文件路径
});
```

## 输出结果

- 子集化后的 WOFF2 字体文件
- 详细的压缩报告 (`subset-report.json`)
- 实时处理进度显示

## 性能优化

通过字体子集化，通常可实现 80-95%的体积缩减，显著提升网页加载速度。

## 技术引用

fontmin 字体子集化依赖：https://github.com/ecomfe/fontmin#api
字体文件格式转化工具: https://transfonter.org/
