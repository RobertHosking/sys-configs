importScripts("zip.js", "zip-ext.js", 'pako.min.js', 'pako-codecs.js');
var FSA = FSA || {};
self.requestFileSystemSync = self.webkitRequestFileSystemSync || self.requestFileSystemSync;
zip.workerScriptsPath = "/";
zip.useWebWorkers = false;

var fsys = requestFileSystemSync(TEMPORARY, 1024*1024*1024, FSA.error);
var root = fsys.root;
var fileReader, worker, dropReader, dropContainer;
var btn = [], paths = [], pendRemove = [];
var emptyFn=function(){};
var img = /image.*/;
var URL = URL || webkitURL;
var blob = self.BlobBuilder || self.WebKitBlobBuilder;

self.onmessage = function(e) {
  var d=e.data;
  switch(d.type){
    case 'getFiles':
    FSA.getFiles();break;
    case 'zipAllFiles3':
    FSA.html=d.html;FSA.zipAllFiles3();break;
    case 'changeName':
    FSA.changeName(d.data);break;
    case 'autoZip':
    FSA.entries=d.src;FSA.fileName=d.data;FSA.fileNo=d.data.length;FSA.html=d.html;FSA.cN=d.cN;
    FSA.autoZip();break;
    case 'reset':
    FSA.reset();break;
    case 'removeFile':
    FSA.getFile(unescape(d.name),'del');break;
    case 'handleDrop':
    FSA.handleDrop(d.data);break;
  }
};

function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
}

FSA = {
  readRootEntries: function(){
    var dirReader = root.createReader();
    var results = [];
    var temp;
    do{
      temp = dirReader.readEntries();
      results = results.concat(temp);
    }while(temp.length);
    return results;
  },
  getFile: function(name,del) {
    var fileEntry = root.getFile(name, null);
    if(del=='del'){
      fileEntry.remove(emptyFn, FSA.error);
    }else{
      var file=fileEntry.file;
      if(img.test(file.type)) {
        var url = fileEntry.toURL();
        FSA.fragment += "<img class='fsImg' width='192' src="+url+" />";
      }
    }
  },
  getFiles: function(callback,endCallback) {
    var paths = [], type = Object.prototype.toString.call(callback);
    FSA.fragment = "";
    var files = FSA.readRootEntries();
    FSA.fileNo=files.length;
    for (var i = 0, len = files.length,entry; entry=files[i]; ++i) {
      FSA.progress(len,i);
      if(type === "[object Function]") {
        callback(entry,i,len);
        if((i+1)==len){endCallback();}
      } else {
        paths.push(entry.toURL());
      }
    }
    postMessage({type:'appendFragment',data:paths});
  },
  write2File: function(e) {
    var name = e.target.name,data = e.target.result,mimetype = e.target.type;
    //if(!name.match(/.jpg|.png/)){FSA.dropCount--;return;}
    FSA.pending.push({name:name,data:data,mimetype:mimetype});
    if(FSA.pending.length==FSA.dropCount){
      FSA.write2File_sub();
    }
  },
  write2File_sub: function(){
    var e = FSA.pending;
    if(e[0]){
      e = FSA.pending.shift();
      var name = e.name, data = e.data, mimetype = e.mimetype;
      var fileEntry = root.getFile(name, {create: true});
      fileEntry.createWriter().write(new Blob([new Uint8Array(data)], {type: mimetype}));
      //fileWriter.write(new Blob([data, {type:mimetype}]));
      //var writer=fileEntry.createWriter().write(new Blob([data, {type:mimetype}]));
      FSA.progress(FSA.dropCount,FSA.dropCount-FSA.pending.length);
      FSA.write2File_sub();
    }else{
      FSA.getFiles();
    }
  },
  removeFile: function(name){
    FSA.getFile(name,'del');
  },
  changeNameTotal: 0,
  changeNameArr: [],
  pendRemove: [],
  changeName: function(data){
    if(data){
      FSA.changeNameArr = data;
      FSA.changeNameTotal = data.length;
    }
    var d = FSA.changeNameArr;
    if(d.length){
      var name = d.shift();
      var total = FSA.changeNameTotal;
      FSA.progress(total, total-d.length);
      try{
        var fileEntry = root.getFile(name.old, {});
        fileEntry.moveTo(root, name.new);
        FSA.changeName();
      }catch(e){
        FSA.pendRemove.push(name.old);
        FSA.changeName();
      }
    }else{
      postMessage({type:"pendRemove",data:FSA.pendRemove});
    }
  },
  autoZip: function(){
    if(!FSA.tempZip){
      zip.createWriter(new zip.BlobWriter(), function(w){FSA.tempZip=w;FSA.entries.shift();FSA.autoZip();});
    }else{
      var t=FSA.entries;zip.useWebWorkers=false;
      if(t[0]){t=t[0];
        var i=FSA.fileNo-FSA.entries.length;
        var url = t;
        FSA.tempZip.add(FSA.fileName[i], new zip.HttpReader(url), function () {
          FSA.progress(FSA.fileNo,i);FSA.entries.shift();FSA.autoZip();
        }, null, function(e){
          postMessage(e);FSA.entries.unshift(t);
        });
      }else if(FSA.html){
        FSA.tempZip.add('index.html',new zip.BlobReader(FSA.html),FSA.autoZip);FSA.html='';
      }else{
        FSA.tempZip.close(function (file) {
          var blobData = new Blob([file], {type:"application/zip"});
          postMessage({type:'saveAs',data:blobData});
        });
      }
    }
  },
  getFilesArray: function(callback){
    if(!FSA.entries){FSA.entries = [];}
    var dirReader=root.createReader();
    var results = FSA.readRootEntries();
    FSA.entries = FSA.entries.concat(toArray(results));
    var data=FSA.entries.sort(function(a,b){
    var aN = a.name, bN = b.name;
    var alc=aN.slice(0,aN.indexOf('.')),blc=bN.slice(0,bN.indexOf('.'));
    return alc > blc ? 1 : alc < blc ? -1 : 0;
    });
    FSA.entries=data;
    if(typeof callback!="function"){return data;}else{callback(data);return true;}
  },
  zipAllFiles3: function(){
    FSA.zipCount=0;FSA.zipTotal=FSA.fileNo;
    FSA.getFilesArray(function (){FSA.zipAllFiles3_sub2();});
  },
  zipAllFiles3_sub2: function(){
    if(!FSA.tempZip){
      zip.createWriter(new zip.BlobWriter(), function(w){
        FSA.tempZip=w;FSA.zipAllFiles3_sub2();
      });
    }else{
      var t=FSA.entries;
      if(t[0]){t=t[0];
        FSA.readFile(t, function (d) {
          d = d.target;
          var name = d.filename, data = d.result;
          FSA.entries.shift();
          FSA.progress(FSA.fileNo,FSA.fileNo-FSA.entries.length);
          FSA.tempZip.add(name, new zip.BlobReader(new Blob([data])),FSA.zipAllFiles3_sub2);
        });
      }else if(FSA.html){
        FSA.tempZip.add('index.html',new zip.BlobReader(FSA.html),FSA.zipAllFiles3_sub2);FSA.html='';
      }else{
        FSA.tempZip.close(function (file) {
          postMessage({type: 'saveAs', data: file});
        });
      }
    }
  },
  readFile: function(f,callback) {
    var file=root.getFile(f.name, null).file();
    fileReader = new FileReader();
    fileReader.filename = file.name;
    fileReader.onload = callback;
    fileReader.readAsArrayBuffer(file);//readAsDataURL,readAsArrayBuffer
  },
  handleDrop: function (e) {
    var count = e.length, file, fileType, fileName;
    FSA.dropCount = count;
    FSA.pending = [];
    var regexp = new RegExp(".jpg|.png", "i");
    for (var i = 0; i < count; i++) {
      file = e[i];
      fileType = file.type;
      fileName = file.name;
      FSA.progress(count, i);
      if(!fileName.match(regexp)){
        FSA.dropCount--;
        continue;
      }
      dropReader = new FileReader();
      dropReader.name = fileName;
      dropReader.type = fileType;
      dropReader.onloadend = FSA.write2File;
      dropReader.readAsArrayBuffer(file);
    }
  },
  progress: function(count,i){
    postMessage({type:'progress',data:[count,i]});
  },
  error: function(e) {
    switch(e.code) {
      case 1:
        postMessage("File or directory doesn't exist");break;
      case 2:
        postMessage("Stop being silly");break;
      case 9:
        postMessage("You've already created it");break;
      case 10:
        postMessage("You've either exceeded your storage quota or you didn't launch Chrome with the '--unlimited-quota-for-files' flag set. See article for instructions on how to do it.");break;
      default:
        postMessage(e);
    }
  },
  reset: function() {
    FSA.getFiles(function(fileEntry){
      fileEntry.remove(emptyFn, FSA.error);
    },FSA.getFiles);
  }
};
