import Fontmin from "fontmin";
import fs from "fs";
import path from "path";

class FontSubsetProcessor {
  constructor(config) {
    this.config = {
      sourceDir: "./fonts/source", // 源字体文件目录
      targetDir: "./fonts/output", // 输出字体文件目录
      charFile: "./charset.txt", // 字符文件
      ...config,
    };
  }

  // 读取字符文件内容并去除重复字符
  readCharacterSet() {
    try {
      const charContent = fs.readFileSync(this.config.charFile, "utf-8");
      // 去重并过滤无效字符
      const uniqueChars = [...new Set(charContent)]
        .filter((char) => char.trim() !== "")
        .join("");
      console.log(`读取到 ${uniqueChars.length} 个唯一字符`);
      return uniqueChars;
    } catch (error) {
      console.error("读取字符文件失败:", error.message);
      process.exit(1);
    }
  }

  // 获取所有字体源文件，支持ttf、otf、woff格式
  getFontFiles() {
    try {
      const files = fs.readdirSync(this.config.sourceDir);
      return files.filter((file) =>
        [".ttf", ".otf", ".woff"].includes(path.extname(file).toLowerCase())
      );
    } catch (error) {
      console.error("读取字体目录失败:", error.message);
      return [];
    }
  }

  // 处理单个字体文件，输出为ttf格式和woff2格式
  processFontFile(fontFile, characterSet) {
    return new Promise((resolve, reject) => {
      const inputPath = path.join(this.config.sourceDir, fontFile);
      const outputName =
        path.basename(fontFile, path.extname(fontFile)) + ".woff2";

      const fontmin = new Fontmin()
        .src(inputPath)
        .use(
          Fontmin.glyph({
            text: characterSet,
            hinting: false,
          })
        )
        .use(Fontmin.ttf2woff2())
        .dest(this.config.targetDir);

      fontmin.run((err, files) => {
        if (err) {
          reject(new Error(`处理字体文件 ${fontFile} 失败: ${err.message}`));
        } else {
          const originalSize = fs.statSync(inputPath).size;
          const optimizedSize = files[0].contents.length;
          const reduction = (
            ((originalSize - optimizedSize) / originalSize) *
            100
          ).toFixed(1);

          console.log(`✓ ${fontFile} -> ${outputName} (压缩率: ${reduction}%)`);
          resolve({
            originalFile: fontFile,
            outputFile: outputName,
            originalSize,
            optimizedSize,
            reduction,
          });
        }
      });
    });
  }

  // 批量处理所有字体文件
  async processAllFonts() {
    console.log("开始字体子集化处理...");

    // 创建输出目录
    if (!fs.existsSync(this.config.targetDir)) {
      fs.mkdirSync(this.config.targetDir, { recursive: true });
    }

    const characterSet = this.readCharacterSet();
    const fontFiles = this.getFontFiles();

    if (fontFiles.length === 0) {
      console.log("未找到可处理的字体文件");
      return;
    }

    console.log(`找到 ${fontFiles.length} 个字体文件`);

    const results = [];
    for (const fontFile of fontFiles) {
      try {
        const result = await this.processFontFile(fontFile, characterSet);
        results.push(result);
      } catch (error) {
        console.error(error.message);
      }
    }

    this.generateReport(results);
    return results;
  }

  // 生成处理报告
  generateReport(results) {
    const totalReduction = results.reduce(
      (sum, result) => sum + parseFloat(result.reduction),
      0
    );
    const avgReduction = (totalReduction / results.length).toFixed(1);

    const report = {
      timestamp: new Date().toISOString(),
      characterCount: this.readCharacterSet().length,
      processedFiles: results.length,
      averageReduction: avgReduction + "%",
      details: results,
    };

    const reportPath = path.join(this.config.targetDir, "subset-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n处理完成! 平均压缩率: ${avgReduction}%`);
    console.log(`详细报告已保存至: ${reportPath}`);
  }
}

// 主执行函数
async function main() {
  const processor = new FontSubsetProcessor({
    sourceDir: "./fonts/source",
    targetDir: "./fonts/output",
    charFile: "./charset.txt",
  });

  await processor.processAllFonts();
}

// 执行程序
main().catch(console.error);
