const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const langMap = new Map([
  ["中文", "zh_CN"],
  ["英文", "en_US"],
  ["日语", "ja_JP"],
  ["韩语", "ko_KR"],
]);

/**
 * 读取文件
 * 1. 必须包含表头
 * 2. 前两列，需要依次为： key, comment
 * 3. 第三列开始为语言列，每个语言的翻译为一列
 * @example
 * | 开发用 key | 描述       | 中文 | 韩语 | 英文  | ... |
 * | ---------- | ---------- | -------- | -------- | ----- | --- |
 * | test_key_1 | 测试用 key | 测试     | 測試     | test  | ... |
 * | hello      | 欢迎界面   | 你好     | 你好     | Hello | ... |
 */
function readXlsxHandler(readPath) {
  const workbook = xlsx.readFile(path.resolve(readPath));
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const range = xlsx.utils.decode_range(sheet["!ref"]);

  let langs = [];

  const allRow = [];
  for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
    const row = [];
    for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
      const cellAddress = xlsx.utils.encode_cell({ r: rowNum, c: colNum });
      const cell = sheet[cellAddress];
      const cellValue = cell ? cell.v : undefined;
      row.push(cellValue);
    }
    allRow.push(row);
  }
  langs = allRow[0].splice(2, allRow[0].length);
  console.log(langs);
  allRow.shift();
  return {
    allRow,
    langs,
  };
}

/**
 * 生成国际化文件
 * @param {所有的行内容} allRow
 * @param {所有的语言} langs
 */
async function generateLocalesFile(allRow, langs, writePath) {
  let count = 0;
  const prettierOptions = await prettier.resolveConfig(
    path.resolve("./.prettierrc.js")
  );

  try {
    langs.forEach(async (lang, index) => {
      let translationObj = {};
      for (const row of allRow) {
        const [key, _, ...translations] = row;

        if (key) {
          let message = translations[index];

          translationObj[key] = message;
        }
      }
      if (!langMap.get(lang)) {
        throw new Error(`不兼容当前语言导入：${lang}`);
      }
      const filePath = path.join(
        writePath,
        `/i18n.${langMap.get(lang).replace("_", "-")}.ts`
      );
      const code = `export default ${JSON.stringify(translationObj)}`;
      try {
        fs.writeFileSync(
          filePath,
          prettier.format(code, {
            parser: "typescript",
            ...prettierOptions,
          }),
          {
            encoding: "utf8",
          }
        );
      } catch (err) {
        console.error(`generate ${lang} file failed, reason: ${err}`);
      }

      ++count;
      if (count === langs.length) {
        console.log("generate locales file completed");
      }
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 * 入口函数
 */
function main(readPath, writePath) {
  const { allRow, langs } = readXlsxHandler(readPath);
  generateLocalesFile(allRow, langs, writePath);
}

module.exports = {
  main,
};
