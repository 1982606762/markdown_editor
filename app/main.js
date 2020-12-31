const { NONAME } = require('dns');
const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

const windows = new Set();
let mainWindow = null;

app.on('ready', () => {
    createwindow();
});

app.on('window-all-closed',()=>{
    if(process.platform=='darwin'){
      return false;
    }else{
      app.quit();
    }
})

app.on('activate',(event,hasVisibleWindows)=>{
  if(!hasVisibleWindows) { createwindow();}　
})

const getFileFromUser = exports.getFileFromUser = (targetwindow) => {
  dialog.showOpenDialog(targetwindow, {
      properties: ['openFile'],
      filters: [
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'Markdown Files', extensions: ['md', 'markdown'] }
      ]
  }).then(result => {
      if (result.filePaths.length > 0) { openFile(targetwindow,result.filePaths[0]); }
  }).catch(err => {
      console.log(err);
  })
};

const openFile = (targetwindow,file) => {
  const content = fs.readFileSync(file).toString();
  targetwindow.webContents.send('file-opened', file, content); // B
};

const createwindow = exports.createwindow = ()=>{
    let x,y;
    const currentwindow = BrowserWindow.getFocusedWindow()
    if(currentwindow){
      const[currentx,currenty]=currentwindow.getPosition();
      x=currentx+20;
      y=currenty+20;
    }
    let newwindow = new BrowserWindow({x,y,
      show:false,
      webPreferences:{
        nodeIntegration:true,
        enableRemoteModule:true
      }
    })
    newwindow.loadFile(`${__dirname}/index.html`);
    
    newwindow.once('ready-to-show',()=>{
        newwindow.show();
    })

    newwindow.on('closed',()=>{
      windows.delete(newwindow);  
      newwindow=null
    }
    );
    windows.add(newwindow);
    return newwindow;
}