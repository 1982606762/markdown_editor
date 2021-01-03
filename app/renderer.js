const { remote, ipcRenderer } = require('electron');
const mainProcess = remote.require('./main.js');

const marked = require('marked');
const path = require('path');

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');

const currentwindow = remote.getCurrentWindow();

let filepath = null;
let originalcontent = '';

const updatetitle = (isedited)=>{
  let title = 'markdown_editor';
  if(filepath){title=`${path.basename(filepath)} - ${title}`};
  if(isedited){title=`*${title}`;}
  currentwindow.setTitle(title);
  currentwindow.setDocumentEdited(isedited);
  saveMarkdownButton.disabled=!isedited;
  revertButton.disabled=!isedited;
}
const renderMarkdownToHtml = (markdown) => {
  htmlView.innerHTML = marked(markdown);
};

const getDraggedFile=(event)=>event.dataTransfer.items[0]; 
const getDroppedFile=(event)=>event.dataTransfer.files[0];

const fileTypeIsSupported =(file) => {
  return ['text/plain','text/markdown','text/x-markdown'].includes(file.type);
};

markdownView.addEventListener('keyup', (event) => {
  const currentContent = event.target.value;
  renderMarkdownToHtml(currentContent);
  updatetitle(currentwindow!=originalcontent);
});

markdownView.addEventListener('dragover',(event)=>{
  const file = getDraggedFile(event);
  console.log(file.type);
  if(fileTypeIsSupported(file)){
    markdownView.classList.add('drag-over');
  }else{
    markdownView.classList.add('drag-error')
  }
});

markdownView.addEventListener('dragleave',()=>{
  markdownView.classList.remove('drag-over');
  markdownView.classList.remove('drag-error');
})

markdownView.addEventListener('drop',(event)=>{
  const file = getDroppedFile(event);
  if (fileTypeIsSupported(file)){
  mainProcess.openFile(currentwindow,file.path);} else {
  alert('That file type is not supported'); }
  
  markdownView.classList.remove('drag-over'); 
  markdownView.classList.remove('drag-error');

});

openFileButton.addEventListener('click', () => {
  mainProcess.getFileFromUser(currentwindow);
});

newFileButton.addEventListener('click',()=>{
  mainProcess.createwindow();
})

saveHtmlButton.addEventListener('click',()=>{
  mainProcess.savefile(currentwindow,htmlView.innerHTML);
})

saveMarkdownButton.addEventListener('click',()=>{
  mainProcess.saveMarkdown(currentwindow,filepath,markdownView.value);
})

revertButton.addEventListener('click',()=>{
  markdownView.value = originalcontent;
  renderMarkdownToHtml(originalcontent);
})

document.addEventListener('dragstart',event=>event.preventDefault());
document.addEventListener('dragover',event=>event.preventDefault());
document.addEventListener('drop',event=>event.preventDefault());
document.addEventListener('dragleave',event=>event.preventDefault());

ipcRenderer.on('file-opened', (event, file, content) => {
  filepath = file;
  originalcontent = content;

  markdownView.value = content;
  renderMarkdownToHtml(content);
  updatetitle();
});
