#!/usr/bin/env node
"use strict";

const commander = require("commander");
const log = require("../module/log");
const importI18n = require("../module/i18n-import");

const meta = require("../package.json");

commander.version(`v${meta.version}`, "-v, --version");

/**
 * 定义命令pnti18n start
 * 简写：pnti18n s
 * commander：<>包裹的options是必传的，使用命令的时候必须要传值的，[]包裹的则是可选的
 * */
commander
  .command("start <readPath> <writePath>")
  .alias("s")
  .description("start command description") // 命令描述，会显示在帮助信息里，执行pnti18n --help可以看到
  .action(function (readPath, writePath) {
    console.log(`${{ readPath, writePath }}`);
    log.info("开始导入...");
    importI18n.main(readPath, writePath);
  });

//其他的命令
commander.command("*").action(function (task) {
  log.error("No current command");
});
// commander解析传入的参数
commander.parse(process.argv);

if (!commander.args.length) {
  // 没有参数的时候
  log.error("readPath & writePath parameter required");
}
