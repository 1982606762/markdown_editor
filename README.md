# a simple markdown editor
{
  "name": "markdown-editor",
  "version": "1.0.0",
  "description": "simple markdown editor",
  "main": "app/main.js",
  "dependencies": {
    "electron": "^3.0.0"
},
  "scripts": {
    "start": "electron .",
    "test": "echo \"Error: no test specified\" && exit 1",
    "macOS-package":"electron-packager . --platform=darwin --arch=x64 --out=../out --asar --overwrite",
    "win64-package":"electron-packager . --platform=win32 --arch=x64 --out=../out --asar --overwrite",
    "package-linux":"electron-packager . --platform=linux -no-sandbox --arch=x64 --download.mirrorOptions.mirror=https://npm.taobao.org/mirrors/electron/ --asar --out=../out --overwrite"

  },
  "author": "Zxl",
  "license": "ISC"
}
