var currentTabId = null, msgAPI = "sendMessage", g = {};
var toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
};
function sendMsg(tab){
  chrome.tabs.get(tab.id, sendMsgSub);
}
function sendMsgSub(tab){
  if(tab.status == 'loading'){
    setTimeout(function(){
      sendMsg(tab);
    }, 250);
  }else{chrome.tabs[msgAPI](tab.id, g.msg.data);}
}

var Store = {
  album: null,
  emptyAlbum: {
    set: [],
    last: 0
  },
  addLocalAlbum: function(item){
    for(var i=0; i<item.length; i++){
      Store.addAlbum(item[i], true);
    }
    Store.set({album: Store.album});
    Store.album = null;
    Store.map();
  },
  addAlbum: function(obj, local){
    var item = {};
    var key = "item" + (+this.album.last+1);
    item[key] = obj;
    this.map(key, obj, local);
    if(!local)this.set(item);
  },
  map: function(key, obj, local){
    if(!this.album){
      this.get('album', function(item){
        console.log(item);
        if(!item.album || !item.album.last)item.album = Store.emptyAlbum;
        Store.album = Store.remap(item.album);
      });
    }else if(arguments.length){
      console.log(obj);
      this.album.last++;
      if(obj.local){
        this.album.set.push(obj);
      }else{
        this.album.set.push({
          key: this.album.last,
          name: (obj.aAuth?(obj.aAuth+"-"):"")+obj.aName,
          cover: obj.photos[0].url,
          len: obj.photos.length,
          date: +new Date()
        });
      }
      if(!local)this.set({album: this.album});
    }
    return this.album;
  },
  remaped: false,
  remap: function(album){
    if(this.remaped)return album;
    this.remap_subQueue = [];
    for(var i=0, j=0; i<album.set.length; i++){
      //console.log(album.set[i]);
      if(!album.set[i].local){
        j++;
        var key = album.set[i].key;
        if(key!=j){
          Store.remap_subQueue.push({key:"item"+key, target:"item"+j});
          album.set[i].key = j;
        }
      }
    }
    album.last = j;
    this.set({album: album});
    if(Store.remap_subQueue.length)this.remap_sub();
    this.remaped = true;
    return album;
  },
  remap_subQueue: [],
  remap_sub: function(){
    var data = Store.remap_subQueue.shift();
    var key = data.key, target = data.target;
    Store.get(key, function(item){
      var o = {};
      o[target] = item[key];
      console.log(key, target, o);
      Store.set(o);
      Store.remove(key, function(){
        if(Store.remap_subQueue.length)Store.remap_sub();
      });
    });
  },
  remapAlbum: function() {
    Store.album = null;
    Store.remaped = false;
    Store.map();
  },
  set: function(item, callback){
    if(arguments.length==1)callback = null;
    chrome.storage.local.set(item, callback);
  },
  get: function(key, callback){
    if(arguments.length==1)callback = function(){return arguments;};
    chrome.storage.local.get(key, callback);
  },
  getAll: function(callback){
    if(arguments.length==0)callback = function(obj){console.log(obj);};
    chrome.storage.local.get(null, callback);
  },
  remove: function(key, callback){
    if(arguments.length==0)callback = function(obj){console.log(obj);};
    chrome.storage.local.remove(key, callback);
  },
  removeAll: function(){
    var len = this.album.last;
    for(var i = 1; i <= len; i++){
      Store.remove('item'+i);
    }
    Store.remove('album');
  }
};

function msgHandle(msg, sender, sendResponse) {
  switch(msg.type){
    case 'store':
      if(msg.add){
        var t = JSON.parse(unescape(msg.data));
        t.photos = t.photos.concat(msg.data.photos);
        localStorage['temp'] = escape(JSON.stringify(t));
      }else{
        localStorage['temp'] = msg.data;
      }
      //console.log(msg.no+' photos data saved.');
      break;
    case 'get':
      getSelected(function(tab) {
        chrome.tabs[msgAPI](tab.id, localStorage['temp']);
      });
      break;
    case 'addAlbum':
      Store.addLocalAlbum(msg.data);
      sendResponse();
      break;
    case 'showPageAction':
      try{
        chrome.pageAction.show(sender.tab.id);
      }catch(e){}
      break;
    case 'event':
      if(msg.data)ga('send', 'event', msg.data[0], msg.data[1], msg.data[2]);
      break;
    case 'last':
      // Export last album
      getSelected(openLastAblum);
      break;
    case 'export':
      try{
        if(localStorage['temp'])delete localStorage['temp'];
        if(!msg.data){
          // Get album by key
          var key = 'item' + msg.key;
          Store.get(key, function(item){
            if (item[key]) {
              console.log(item);
              msg.data = item[key];
              postData(msg);
            }
          });
        }else{
          // Normal
          Store.addAlbum(msg.data);
          if (msg.saveOnly) {
            return;
          }
          var d = msg.data;
          if(d.photos.length)ga('send', 'event', 'photo', 'save', 'keyboard', d.photos.length);
          if(d.type && d.type.length){
            var type = d.newL?d.newL_Type:d.type;
            if(type)ga('send', 'event', 'photo', 'type', type);
            if(!d.type.match(/Group|Album|Instagram|Weibo/)){
              ga('send', 'event', 'photo', 'layout', (d.newL?'NewsFeed':'Timeline'));
            }
          }
          postData(msg);
        }
      }catch(e){
        throw e;
      }
      break;
    case 'remapAlbum':
      Store.remapAlbum();
      break;
  }
}
function postData(msg){
  try{msg.data.largeAlbum = !!localStorage.largeAlbum.length;}catch(e){}
  try{msg.data.newLayout = !!localStorage.newLayout.length;}catch(e){}
  //console.log('Export '+msg.data.photos.length+' photos.');
  if(msg.data){
    g.msg = msg;
    getSelected(msgHandleSub);
  }
}
function getSelected(callback){
  if(chrome.tabs.query){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length == 0) {
        chrome.tabs.query({active: true}, function(tabs) {
          for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].incognito === false) {
              callback(tabs[i]);
              break;
            }
          }
        });
      } else {
        callback(tabs);
      }
    });
  }else{
    chrome.tabs.getSelected(null, callback);
  }
}
function msgHandleSub(tab){
  tab = (toType(tab)=="array")?tab[0]:tab;
  if((tab.url+"").match(/photos\.html\?key=/) && chrome.tabs.query && tab.selected){
    sendMsg(tab);
  }else{
    var page = localStorage['newLayout'].length ? '../photos.html' : '../fbphotos.html';
    chrome.tabs.create({ url:chrome.extension.getURL(page), index:tab.index+1, active:true }, sendMsg);
  }
}
function openLastAblum(tab) {
  tab = toType(tab) == 'array' ? tab[0] : tab;
  var page = localStorage['newLayout'].length ? '../photos.html' : '../fbphotos.html';
  var url = chrome.extension.getURL(page) + '?key=' + Store.album.last;
  chrome.tabs.create({url: url, index:tab.index+1, active:true}, sendMsg);
}
function setRequestListener(){
  /*chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details){
      console.log(arguments);
      for (var i = 0; i < details.requestHeaders.length; ++i) {
        if (details.requestHeaders[i].name === 'Origin') {
          details.requestHeaders.splice(i, 1);
          break;
        }
      }
      console.log('after', details.requestHeaders);
      return {requestHeaders: details.requestHeaders};
    },
    {urls: ['*://www.facebook.com/ajax/pagelet/*']},
    ['blocking', 'requestHeaders']
  );

  chrome.webRequest.onHeadersReceived.addListener(
    function(details){
      console.log(arguments);
      for (var i = 0; i < details.responseHeaders.length; ++i) {
        if (details.responseHeaders[i].name === 'x-frame-options') {
          details.responseHeaders.splice(i, 1);
          break;
        }
      }
      details.responseHeaders.push({name: 'access-control-allow-origin', value: '*'});
      details.responseHeaders.push({name: 'access-control-allow-headers', value: 'Origin, X-Requested-With, Content-Type, Accept'});
      details.responseHeaders.push({name: 'access-control-allow-credentials', value: 'true'});
      return {responseHeaders: details.responseHeaders};
    },
    {urls: ['*://www.facebook.com/ajax/pagelet/*']},
    ['blocking', 'responseHeaders']
  );*/
  /*chrome.webRequest.onHeadersReceived.addListener(
    function(details){
      console.log(arguments);
      for (var i = 0; i < details.responseHeaders.length; ++i) {
        if (details.responseHeaders[i].name === 'x-frame-options') {
          details.responseHeaders.splice(i, 1);
          break;
        }
      }
      details.responseHeaders.push({name: 'access-control-allow-origin', value: '*'});
      details.responseHeaders.push({name: 'access-control-allow-headers', value: 'Origin, X-Requested-With, Content-Type, Accept'});
      details.responseHeaders.push({name: 'access-control-allow-credentials', value: 'true'});
      return {responseHeaders: details.responseHeaders};
    },
    {urls: ['*://*.twimg.com/*']},
    ['blocking', 'responseHeaders']
  );*/
  chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details){
      console.log(arguments);
      for (var i = 0; i < details.requestHeaders.length; ++i) {
        if (details.requestHeaders[i].name === 'Origin') {
          details.requestHeaders.splice(i, 1);
          break;
        }
      }
      console.log('after', details.requestHeaders);
      return {requestHeaders: details.requestHeaders};
    },
    {urls: ['*://photo.weibo.com/page/*']},
    ['blocking', 'requestHeaders']
  );
}

try{chrome.runtime.onMessage.addListener(msgHandle);}catch(e){
  chrome.extension.onRequest.addListener(msgHandle);msgAPI="sendRequest";}
function checkForValidUrl(tabId, changeInfo, tab) {
  var extUrl = chrome.runtime.getURL('');
  var regx = new RegExp(extUrl + '|facebook.com|instagram.com|ask.fm|' +
    'pinterest.com|twitter.com|weibo.com', 'i');
  currentTabId = tabId;
  if(regx.test(tab.url)){
    chrome.pageAction.show(tabId);
  }
};

(function(){
  chrome.tabs.onUpdated.addListener(checkForValidUrl);
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
  ga('create', 'UA-38726447-3', 'auto');
  ga('set', 'checkProtocolTask', function(){});
  ga('require', 'displayfeatures');

  chrome.runtime.onInstalled.addListener(function(o) {
    if(o.reason!="chrome_update")ga('send', 'event', 'extension', o.reason, chrome.runtime.getManifest().version, null, {'nonInteraction': 1});
  });
  Store.map();
  //setRequestListener();
})();
