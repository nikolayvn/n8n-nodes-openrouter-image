const { src, dest } = require('gulp');

function copyIcons() {
  return src('src/**/*.{png,svg,jpg,jpeg}')
    .pipe(dest('dist/'));
}

exports.build = copyIcons;
exports['build:icons'] = copyIcons;