const { NONAME } = require('dns');
const { app, BrowserWindow, dialog, remote } = require('electron');
const fs = require('fs');
const openwindows = new Map();
const windows = new Set();
let mainWindow = null;

app.on('ready', () => {
  createwindow();
});

app.on('window-all-closed', () => {
  if (process.platform == 'darwin') {
    return false;
  } else {
    app.quit();
  }
})

app.on('activate', (event, hasVisibleWindows) => {
  if (!hasVisibleWindows) { createwindow(); }
})

app.on('will-finish-launching', () => {
  app.on('open-file', (event, file) => {
    const win = createwindow();
    win.once('ready-to-show', () => {
      openFile(win, file);
    })
  })
})
const getFileFromUser = exports.getFileFromUser = (targetwindow) => {
  dialog.showOpenDialog(targetwindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] }
    ]
  }).then(result => {
    if (result.filePaths.length > 0) { openFile(targetwindow, result.filePaths[0]); }
  }).catch(err => {
    console.log(err);
  })
};

const openFile = exports.openFile =  (targetwindow, file) => {
  const content = fs.readFileSync(file).toString();
  targetwindow.webContents.send('file-opened', file, content);
  app.addRecentDocument(file);
  targetwindow.setRepresentedFilename(file);
};

const savefile = exports.savefile = (targetwindow, content) => {
  let file=null;  
  dialog.showSaveDialog(targetwindow, {
      title: 'save html',
      defaultPath: app.getPath("documents"),
      buttonLabel: '保存',
      filters: [
        { name: "html file", extensions: ["html"] }
      ]
    }).then(result => {
      file=result.filePath;
      fs.writeFileSync(result.filePath, content);
      console.log(result)
    }).catch(err => {
      console.log(err)
    });
  if (!file) { return; }
  console.log(file);
  fs.writeFileSync(file, content);
}

const saveMarkdown = exports.saveMarkdown = (targetWindow, file, content) => {

  if (!file) {
    dialog.showSaveDialog(targetWindow, {
      title: 'Save Markdown',
      defaultPath: app.getPath('documents'),
      filters: [
        { name: 'Markdown Files', extensions: ['md', 'markdown'] }
      ]
    }
    ).then(result => {
      fs.writeFileSync(result.filePath, content);
      openFile(targetWindow,result.filePath);
      console.log(result)
    }).catch(err => {
      console.log(err)
    });
  }
  if (!file) return;
  console.log(file);

  fs.writeFileSync(file, content);
  openFile(targetWindow, file);
};



const createwindow = exports.createwindow = () => {
  let x, y;
  const currentwindow = BrowserWindow.getFocusedWindow()
  if (currentwindow) {
    const [currentx, currenty] = currentwindow.getPosition();
    x = currentx + 20;
    y = currenty + 20;
  }
  let newwindow = new BrowserWindow({
    x, y,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })
  newwindow.loadFile(`${__dirname}/index.html`);

  newwindow.once('ready-to-show', () => {
    newwindow.show();
  })

  newwindow.on('closed', () => {
    windows.delete(newwindow);
    stopwatchingfile(newwindow);
    newwindow = null
  }
  );
  windows.add(newwindow);
  return newwindow;
}

const startwatchingfile = (targetwindow,file)=>{
  stopwatchingfile(targetwindow);
  const watch = fs.watchFile(file,(event)=>{
    if (event=='change') {
      const content = fs.readFileSync(file);
      targetwindow.webContents.send('file-opened',file,content);
    }
  });
  openwindows.set(targetwindow,watch);
}

const stopwatchingfile = (targetWindow)=>{
  if (openwindows.has(targetWindow)) {
    openwindows.get(targetWindow).stop();
    openwindows.delete(targetWindow);
  }
}