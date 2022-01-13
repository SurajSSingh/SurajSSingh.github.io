const Metalsmith = require("metalsmith");
const pug = require("metalsmith-pug");
const stylus = require("metalsmith-stylus");



Metalsmith(__dirname)
  .use(pug())
  .use(stylus())
  .build(function (err) {
    if (err) throw err
    console.log('Build finished!')
  })