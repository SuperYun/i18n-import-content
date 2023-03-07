const colors = require("colors");

module.exports = {
  info: (msg) => {
    console.log(colors.green(msg));
  },
  error: (msg) => {
    console.log(colors.red(msg));
  },
};
