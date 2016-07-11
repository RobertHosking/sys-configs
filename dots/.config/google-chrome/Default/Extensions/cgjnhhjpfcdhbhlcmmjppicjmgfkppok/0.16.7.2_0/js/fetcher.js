var g = {};
function getParent(child, selector){
  var target = child;
  while(target && !target.querySelector(selector)){
    if (target.parentNode && target.parentNode.tagName == 'BODY') {
      return target;
    }
    target = target.parentNode;
  }
  return target ? target.querySelector(selector) : null;
}
function getText(s, html, parent){
  var q = parent ? parent.querySelector(s) : qS(s);
  var t = 'textContent';
  if(q && q.querySelectorAll('br').length){t = 'innerHTML';}
  if(q && html && q.querySelectorAll('a').length){t = 'innerHTML';}
  return q ? q[t] : "";
}
function getDOM(html){
  var doc;
  if(document.implementation){
    doc = document.implementation.createHTMLDocument('');
    doc.documentElement.innerHTML = html;
  }else if(DOMParser){
    doc = (new DOMParser).parseFromString(html, 'text/html');
  }else{
    doc = document.createElement('div');
    doc.innerHTML = html;
  }
  return doc;
}
function quickSelect(s){
  var method = false;
  switch(s){
    case /#\w+$/.test(s):
      method = 'getElementById'; break;
    case /\.\w+$/.test(s):
      method = 'getElementsByClassName'; break;
  }
  return method;
}
function qS(s){var k = document[quickSelect(s) || 'querySelector'](s);return k&&k.length ? k[0] : k;}
function qSA(s){return document[quickSelect(s) || 'querySelectorAll'](s);}
function padZero(str, len) {
  str = str.toString();
  while (str.length < len) {
    str = '0' + str;
  }
  return str;
}
function parseTime(t){
  var d = new Date(t * 1000);
  return d.getFullYear() + '-' + padZero(d.getMonth() + 1, 2) + '-' +
    padZero(d.getDate(), 2) + ' ' + padZero(d.getHours(), 2) + ':' +
    padZero(d.getMinutes(), 2) + ':' + padZero(d.getSeconds(), 2);
}
function parseQuery(s){
  var data = {};
  var n = s.split("&");
  for(var i=0; i<n.length; i++){
    var t = n[i].split("=");
    data[t[0]] = t[1];
  }
  return data;
}
function parseFbSrc(s, fb) {
  if (fb) {
    return s.replace(/s\d{3,4}x\d{3,4}\//g, '');
  } else {
    return s.replace(/\w\d{3,4}x\d{3,4}\//g, '');
  }
}
function getFbid(s){
  var fbid = s.match(/fbid=(\d+)/);
  if(!fbid){
    if(s.match('opaqueCursor')){
      var index = s.indexOf('/photos/');
      if(index != -1){
        fbid = getFbid(s.slice(index + 8));
        if(fbid){
          return fbid;
        }
      }
      if(!fbid){
        fbid = s.match(/\/([0-9]+)\//);
        if(!fbid){
          fbid = s.match(/([0-9]{5,})/);
        }
      }
    }else if(s.match('&') && s.indexOf('/photos/') == -1){
      try{
        fbid = s.slice(s.indexOf('=') + 1, s.indexOf('&'));
      }catch(e){}
      return fbid ? fbid : false;
    } else {
      // id for page's photos
      fbid = s.match(/\/photos\/[\w\d\.-]+\/(\d+)/);
    }
  }
  return fbid.length ? fbid[1] : false;
}
function extractJSON(str) {
  // http://stackoverflow.com/questions/10574520/
  var firstOpen, firstClose, candidate;
  firstOpen = str.indexOf('{', firstOpen + 1);
  var countOpen = 0, countClose = 0;
  do {
    countOpen++;
    firstClose = str.lastIndexOf('}');
    if (firstClose <= firstOpen) {
      return null;
    }
    countClose = 0;
    do {
      countClose++;
      candidate = str.substring(firstOpen, firstClose + 1);
      var res;
      try {
        res = JSON.parse(candidate);
        return res;
      } catch (e) {}
      try {
        res = eval("(" + candidate + ")");
        return res;
      } catch (e) {}
      firstClose = str.substr(0, firstClose).lastIndexOf('}');
    } while (firstClose > firstOpen && countClose < 20);
    firstOpen = str.indexOf('{', firstOpen + 1);
  } while (firstOpen != -1 && countOpen < 20);
}
function output(){
  g.photodata.dTime = (new Date).toLocaleString();
  if(location.href.match(/.*facebook.com/)){
    document.title = document.title.match(/(?:.*\|\|)*(.*)/)[1];
    var t = g.statusEle;
    t.innerHTML = g.statusText;
    var b=qS('#stopAjax');
    if(b){t.parentNode.removeChild(b);}
    g.photodata.newL = g.newL;
    g.photodata.newLayout = g.newLayout;
    var p=location.href+'&';
    var isAl = p.match(/media\/set|media|set=a/),
    isPS = p.match(/photos_stream/), isGp = p.match(/group/),
    isPhoto = p.match(/photo/), isSearch = p.match(/search/),
    isPage = qS('[aria-labelledby="pages_name"]');
    g.photodata.type = isPage ? 'Page' : isAl ? 'Album' : isPS ? 
      'PhotoStream': isGp ? 'Group' : isSearch ?
      'Search' : isPhoto ? 'Photo' : '';
    if(g.newL){p = qS('#pagelet_timeline_medley_photos a[aria-selected="true"]').getAttribute('aria-controls').match(/.*_(.*)/)[1];var tab = p.split(':')[2];g.photodata.newL_Type=tab==4?'TaggedPhotos':tab==5?'AllPhotos':tab==70?'UntaggedPhotos':'';}
  }else if(location.href.match(/.*instagram.com/)){
    g.photodata.type = 'Instagram';
    g.status.e.textContent = g.status.t;
    document.title=g.photodata.aName;
  }else if(location.href.match(/twitter.com/)){
    g.photodata.type = 'Twitter';
    document.title=g.photodata.aName;
  }else if(location.href.match(/ask.fm/)){
    g.photodata.type = 'Ask.fm';
    document.title = g.title;
  }else if(location.href.match(/weibo.com/)){
    g.photodata.type = 'Weibo';
    document.title=g.photodata.aName;
  }else if(location.href.match(/pinterest.com/)){
    g.photodata.type = 'Pinterest';
    document.title=g.photodata.aName;
  }
  var ajaxCkb = qS('#stopAjax');
  if(ajaxCkb)ajaxCkb.parentNode.removeChild(ajaxCkb);
  if(g.photodata.photos.length>1000 && !g.largeAlbum){
    if(confirm('Large amount of photos may crash the browser:\nOK->Use Large Album Optimize Cancel->Continue'))g.photodata.largeAlbum = true;
  }
  try{chrome.extension.sendMessage({type:'export',data:g.photodata});}
  catch(e){chrome.extension.sendRequest({type:'export',data:g.photodata});}
}
function handleFbAjax(fbid) {
  var d = g.dataLoaded[fbid];
  if (d !== undefined) {
    var photos = g.photodata.photos;
    var i = g.ajaxLoaded;
    if (g.urlLoaded[fbid]) {
      photos[i].url = g.urlLoaded[fbid];
      delete g.urlLoaded[fbid];
    }
    if (g.commentsList[fbid]) {
      photos[i].comments = g.commentsList[fbid];
      delete g.commentsList[fbid];
    }
    photos[i].title = d.title;
    photos[i].tag = d.tag;
    photos[i].date = d.date;
    delete g.dataLoaded[fbid];
    delete photos[i].ajax;
    g.ajaxLoaded++;
    return true;
  }
  return false;
}
function handleFbAjaxComment(data) {
  var comments = data.comments, profiles = Object.keys(data.profiles);
  var commentsList = [data.feedbacktargets[0].commentcount];
  var fbid = comments[0].ftentidentifier;
  var timeFix = new Date(parseTime(data.servertime)) - new Date();
  for (var j = 0; j < profiles.length; j++) {
    try {
      var p = data.profiles[profiles[j]];
      g.profilesList[p.id] = {name: p.name, url: p.uri};
    } catch(e) {}
  }
  for (j = 0; j < comments.length; j++){
    try {
      var c = comments[j];
      p = g.profilesList[c.author];
      commentsList.push({
        fbid: fbid,
        id: c.legacyid,
        name: p.name,
        url: p.url,
        text: c.body.text,
        date: parseTime(c.timestamp.time)
      });
    } catch(e) {}
  }
  g.commentsList[fbid] = commentsList;
  g.commentsList.count++;
}
function fbAjax(){
  var len=g.photodata.photos.length,i=g.ajaxLoaded;
  var src;
  try{
    src = getFbid(g.photodata.photos[i].href);
  }catch(e){
    if(i + 1 < len){g.ajaxLoaded++; fbAjax();}else{output();}
    return;
  }
  //console.log(src);
  if (handleFbAjax(src)) {
    if(len<50||i%15==0)console.log('Loaded '+(i+1)+' of '+len+'. (cached)');
    g.statusEle.textContent='Loading '+(i+1)+' of '+len+'.';
    if(i+1!=len){document.title="("+(i+1)+"/"+(len)+") ||"+g.photodata.aName;fbAjax();
    }else{output();}
  }else if(!qS('#stopAjaxCkb')||!qS('#stopAjaxCkb').checked){
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    clearTimeout( g.timeout );
    var r=this.response,htmlBase=document.createElement('html');
    htmlBase.innerHTML=r.slice(6,-7);
    var targetJS=htmlBase.querySelectorAll('script'),list=[src];
    for(var k=0;k<targetJS.length;k++){
      var t=targetJS[k].textContent,content=t.slice(t.indexOf('(2, {')+4,t.indexOf('}, true);}')+1);
      if(!content.length||t.indexOf('JSONPTransport')<0){continue;}
      content=JSON.parse(content);
      var require=content.payload.jsmods.require;
      if(require&&(content.id=='pagelet_photo_viewer'||require[0][1]=='addPhotoFbids')){list=require[0][3][0];}
      for (var ii = 0; ii < require.length; ii++) {
        if(!require[ii] || !require[ii].length)continue;
        if(require[ii].length > 2 && require[ii][0] == 'UFIController'){
          var inst = require[ii][3];
          if(inst.length && inst[2].comments && inst[2].comments.length){
            handleFbAjaxComment(inst[2]);
          }
        }
        if (require[ii][1] == 'storeFromData') {
          var image = require[ii][3][0].image;
          if (image) {
            var keys = Object.keys(image);
            for (var j = 0; j < keys.length; j++) {
              var pid = keys[j];
              if (image[pid].url) {
                g.urlLoaded[pid] = image[pid].url;
              }
            }
          }
        }
      }
      if(t.indexOf('fbPhotosPhotoTagboxBase')>0||t.indexOf('fbPhotosPhotoCaption')>0){
        var markup=content.payload.jsmods.markup;
        for(var ii=0;ii<markup.length;ii++){
          var markupContent=markup[ii];
          for(var j=0;j<markupContent.length;j++){
            var test=markupContent[j].__html;
            if(!test){continue;}
            var h=document.createElement('div');h.innerHTML=unescape(test);
            var c=h.querySelectorAll(".fbPhotosPhotoCaption");
            var b=h.querySelectorAll(".fbPhotosPhotoTagboxes");
            var a=h.querySelectorAll("abbr");
            if(!c.length){continue;}
            for(var kk=0;kk<c.length;kk++){
              var s=c[kk].querySelector(".hasCaption");
              s=!s?'':s.innerHTML.match(/<br>|<wbr>/)?s.outerHTML.replace(/'/g,'&quot;'):s.textContent;
              var tag=b[kk].querySelector('.tagBox');
              tag=!tag?'':b[kk].outerHTML;
              var date=(a&&a[kk])?parseTime(a[kk].dataset.utime):'';
              g.dataLoaded[list[kk]]={tag:tag,title:s,date:date};
            }
          }
        }
      }
      // Fallback to old comment
      var instances = content.payload.jsmods.instances;
      for(ii=0; instances && ii<instances.length; ii++){
        if(!instances[ii] || !instances[ii].length || !instances[ii][1])continue;
        if(instances[ii] && instances[ii].length>2 && instances[ii][1].length && instances[ii][1][0]=="UFIController"){
          inst = instances[ii][2];
          if(inst.length && inst[2].comments && inst[2].comments.length){
            handleFbAjaxComment(inst[2]);
          }
        }
      }
    }
    handleFbAjax(src);
    if(len<50||i%15==0)console.log('Loaded '+(i+1)+' of '+len+'.');
    t=g.statusEle;
    if(!t.nextElementSibling){var stopBtn=document.createElement('label');stopBtn.id='stopAjax';stopBtn.innerHTML='<a class="navItem"> | Stop</a><input id="stopAjaxCkb" type="checkbox">';t.parentNode.appendChild(stopBtn);}
    t.textContent='Loaded '+(i+1)+' of '+len+'.';
    if(i+1>=len){
      output();
    }else{
      if(i==g.ajaxLoaded){g.ajaxRetry++}
      if (g.ajaxRetry > 5) {
        if (g.ajaxAutoNext) {
          g.ajaxRetry = 0;
          g.ajaxLoaded++;
        } else {
          var retryReply = prompt('Retried 5 times.\nTry again->OK\n' +
            'Try next photo->Type 1\nAlways try next->Type 2\n' +
            'Output loaded photos->Cancel');
          if (retryReply !== null) {
            g.ajaxRetry = 0;
            if (+retryReply === 2){
              g.ajaxAutoNext = true;
              g.ajaxLoaded++;
            } else {
              g.ajaxLoaded++;
            }
          } else {
            output();
            return;
          }
        }
      }
      document.title="("+(i+1)+"/"+(len)+") ||"+g.photodata.aName;fbAjax();
    }
  };
  xhr.onreadystatechange = function(){
    if(xhr.readyState == 2 && xhr.status != 200){
      // console.log(i, g.photodata.photos[i]);
      // console.log(this, xhr);
      g.ajaxLoaded++;
      fbAjax();
    }
  };
  xhr.open("GET", g.photodata.photos[i].ajax);
  g.timeout=setTimeout(function(){
    xhr.abort();
    g.ajaxRetry++;
    if(g.ajaxRetry>5){if(confirm('Timeout reached.\nTry again->OK\nOutput loaded photos->Cancel')){g.ajaxRetry=0;fbAjax();}else{output();}}
  },10000);
  xhr.send();}else{output();}
}
function getPhotos(){
  if(g.start!=2||g.start==3){return;}
  //var scrollEle = !!(qS('#fbTimelinePhotosScroller *')||qS('.uiSimpleScrollingLoadingIndicator')||qS('.fbStarGrid~img')||qS('#BrowseResultsContainer').parentNode.querySelector('.hidden_elem img'));
  var scrollEle = !!(qS('#fbTimelinePhotosScroller *') || 
    qS('.uiSimpleScrollingLoadingIndicator') || qS('.fbStarGrid~img') ||
    qS('.fbStarGridWrapper~img') || qS('#browse_result_below_fold') ||
    (!qS('#browse_end_of_results_footer') && qS('#contentArea div.hidden_elem')
    && location.href.match('search')) ||
    qS('#mainContainer span[aria-busy="true"]'));
  if(g.ajaxFailed&&g.mode!=2&&scrollEle){scrollTo(0, document.body.clientHeight);setTimeout(getPhotos,2000);return;}//g.start=3;
  var i, photodata = g.photodata, testNeeded = 0, ajaxNeeded = 0;
  var elms = g.elms || qS('#album_pagelet') || qS('#static_set_pagelet') || qS('#pagelet_photos_stream') || qS('#group_photoset') || qS('#initial_browse_result') || qS('#contentArea') || qS('._2eec');
  var grid = qSA('.fbStarGrid');
  var selector = 'a[rel="theater"]';
  var tmp = [], tmpE, eLen;
  if(g.elms){ajaxNeeded=1;}
  else if(grid.length){
    if(grid.length>1){
      for(eLen = 0; eLen<grid.length; eLen++){
        tmpE = grid[eLen].querySelectorAll(g.thumbSelector);
        for(var tmpLen = 0; tmpLen<tmpE.length; tmpLen++){
          tmp.push(tmpE[tmpLen]);
        }
      }
      elms = tmp; ajaxNeeded=1;
    }else{elms=grid[0].querySelectorAll(g.thumbSelector);ajaxNeeded=1;}
  }else if(elms){
    var temp = elms.querySelectorAll(g.thumbSelector);ajaxNeeded=1;
    if(!temp.length){
      testNeeded = 1;
      tmpE = elms.querySelectorAll(selector);
      for(eLen = 0; eLen < tmpE.length; eLen++){
        if (tmpE[eLen].querySelector('img')) {
          tmp.push(tmpE[eLen]);
        }
      }
      elms = tmp;
    }else{
      elms = temp;
    }
  }
  else{elms=qSA(selector);testNeeded=1;}
  if(qSA('.fbPhotoStarGridElement')){ajaxNeeded=1;}

  var pageOthers = qSA('.uiLayer a[rel="theater"]');
  if (qS('[aria-labelledby="pages_name"]') && pageOthers.length) {
    elms = pageOthers;
    g.pagePosted = !pageOthers.length;
  }

  if(g.mode!=2&&!g.lastLoaded&&scrollEle&&(!qS('#stopAjaxCkb')||!qS('#stopAjaxCkb').checked)){
    fbAutoLoad(elms);return;
  }
  for (i = 0;i<elms.length;i++) {
    if (testNeeded) {
      var test1 = (getParent(elms[i],'.mainWrapper')&&getParent(elms[i],'.mainWrapper').querySelector('.shareSubtext')&&elms[i].childNodes[0]&&elms[i].childNodes[0].tagName=='IMG');
      var test2 = (getParent(elms[i],'.timelineUnitContainer')&&getParent(elms[i],'.timelineUnitContainer').querySelector('.shareUnit'));
      var test3 = (elms[i].querySelector('img')&&!elms[i].querySelector('img').scrollHeight);
      if (test1 || test2 || test3) {
        continue;
      }
    }
    try{
    var ajaxify = unescape(elms[i].getAttribute('ajaxify')) || '';
    var parentSrc = elms[i].parentNode ? 
      elms[i].parentNode.getAttribute('data-starred-src') : '';
    var bg = elms[i].childNodes[0];
    bg = bg ? bg.style.backgroundImage.slice(5, -2) : '';
    var url = ajaxify.indexOf('&src') != -1 ? ajaxify : (parentSrc || bg);
    var href = elms[i].href, downurl;
    var fbid = getFbid(href);
    if(href.match('opaqueCursor')){
      if(fbid){
        href = 'https://www.facebook.com/photo.php?fbid=' + fbid;
      }else{
        continue;
      }
    }else if(href.match('&')){
      href=href.slice(0, href.indexOf('&'));
    }
    if(!g.downloaded[fbid]){g.downloaded[fbid]=1;}else{continue;}
    if(!g.notLoadCm){
      var q = {};
      var ajax = '';
      if (url.indexOf('&src') != -1) {
        ajax = url.slice(url.indexOf("?")+1,url.indexOf("&src")).split("&");
        url = parseFbSrc(url.match(/&src.(.*)/)[1]).replace(/&smallsrc=.*\?/, '?', true);
      } else {
        ajax = elms[i].href.slice(elms[i].href.indexOf('?') + 1).split('&');
        var pset = elms[i].href.match(/\/photos\/([\.\d\w-]+)\//);
        if (pset) {
          q = {set: pset[1]};
        }
      }
      for(var j=0;j<ajax.length;j++){var d=ajax[j].split("=");q[d[0]]=d[1];}
      if(!q.fbid && fbid){
        q.fbid = fbid;
      }
      ajax='https://www.facebook.com/ajax/pagelet/generic.php/PhotoViewerInitPagelet?ajaxpipe=1&ajaxpipe_token='+g.Env.ajaxpipe_token+'&no_script_path=1&data='+JSON.stringify(q)+'&__user='+g.Env.user+'&__a=1&__adt=2';
    }
    if(url.match(/\?/)){
      var b=url.split('?'), t='', a=b[1].split('&');
      for(var ii=0;ii<a.length;ii++){
        if(a[ii].match(/oh|oe|__gda__/))t+=a[ii]+'&';
      }
      url = b[0] + (t.length?('?'+t.slice(0, -1)):'');
    }else{url=url.slice(0, url.indexOf('&'));}
    var title = elms[i].getAttribute('title')||elms[i].querySelector('img')?elms[i].querySelector('img').getAttribute('alt'):''||'';
    title=title.indexOf(' ')>0?title:'';
    title=title.indexOf(': ')>0||title.indexOf('： ')>0?title.slice(title.indexOf(' ')+1):title;
    if(!title){
    t=getParent(elms[i],'.timelineUnitContainer')||getParent(elms[i],'.mainWrapper');
    if(t){var target1=t.querySelectorAll('.fwb').length>1?'':t.querySelector('.userContent');}
    var target2=elms[i].getAttribute('aria-label')||'';
    if(target2){title=target2;}
    if(title===''&&target1){title=target1.innerHTML.match(/<br>|<wbr>/)?target1.outerHTML.replace(/'/g,'&quot;'):target1.textContent;}
    }
    var newPhoto={url: url, href: href};
    newPhoto.title=title;
    if(!g.notLoadCm)newPhoto.ajax=ajax;
    photodata.photos.push(newPhoto);
    }catch(e){console.log(e);}
  }
  /*if(g.store){
    var temp=escape(JSON.stringify(photodata));
    console.log('sent to bg');
    chrome.extension.sendRequest({type:'store',data:temp,no:photodata.photos.length,add:(g.mode==4||g.mode==3)});
    if(g.mode!=4){
    window.alert('Please go to next page.');
    }else{setTimeout(function(){chrome.extension.sendRequest({type:'export'});},1000);}
  }else{*/
    if(qS('#stopAjaxCkb')&&qS('#stopAjaxCkb').checked){qS('#stopAjaxCkb').checked=false;}
    console.log('export '+photodata.photos.length+' photos.');
    if(!g.notLoadCm){
      if(ajaxNeeded&&(g.loadCm||confirm("Try to load photo's caption?"))){fbAjax();}else{output();}
    }else{output();}
  //}
}
function getFbMessagesPhotos(){
  if(!g.offset){
    g.ajaxRetry = {};
    g.offset = 0;
    g.photodata.aName = getText('#webMessengerHeaderName');
    g.photodata.aDes = qS('#webMessengerHeaderName').innerHTML;
    g.fb_dtsg = qS('[name=fb_dtsg]').value;
    var threadId = location.href.match(/conversation-(\d+)/);
    var userId = qS('#webMessengerHeaderName a');
    if(threadId){
      threadId = threadId[1];
    }else if(userId){
      threadId = userId.getAttribute('data-hovercard').match(/id=(\d+)&/)[1];
    }else{
      alert('Cannot get message info.');
      return;
    }
    g.threadId = threadId;
  }
  var url = 'https://www.facebook.com/ajax/messaging/attachments/sharedphotos.php';
  var data = 'thread_id='+g.threadId+'&offset='+g.offset+'&limit=30&__user='+g.Env.user+'&__a=1&__req=7&fb_dtsg='+g.fb_dtsg;
  var xhr = new XMLHttpRequest();
  xhr.onload = function(){
    var elms = g.elms.length ? g.elms : [];
    var payload = JSON.parse(this.response.slice(9)).payload;
    if(payload.imagesData){
      for(var i in payload.imagesData){
        if(payload.imagesData.hasOwnProperty(i)){
          elms.push({
            fbid: i,
            url: payload.imagesData[i].URI
          });
        }
      }
      if(elms.length){
        g.elms = elms;
        if(payload.moreImagesToLoad){
          g.offset += 30;
          getFbMessagesPhotos();
        }else{
          fbAjaxAttachment();
        }
      }else{
        alert('No photo attachments found.');
      }
    }
  };
  xhr.open('POST', url);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send(data);
}
function fbAjaxAttachment(){
  var len = g.elms.length, i = g.ajaxLoaded;
  if(len && len > g.photodata.photos.length){
    var elms = g.elms[i];
    var fbid = elms.fbid;
    if(!g.ajaxRetry[fbid]){
      g.ajaxRetry[fbid] = 0;
    }
    if(!g.dataLoaded[fbid] && g.ajaxRetry[fbid]<3){
      g.ajaxRetry[fbid]++;
      var xhr = new XMLHttpRequest();
      xhr.onload = function(){
        var output = JSON.parse(JSON.parse(this.response.slice(9)).payload.output);
        var images = output[g.threadId].message_images.edges
        for(var i = 0; i < images.length; i++){
          g.dataLoaded[images[i].node.id] = 1;
          g.photodata.photos.push({
            href: '',
            url: images[i].node.image2.uri
          });
        }
        g.ajaxLoaded++;
        fbAjaxAttachment();
      };
      xhr.open('POST', 'https://www.facebook.com/ajax/graphql/query/');
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      var after = i > 0 ? ('&params[after]=' + g.elms[i - 1].fbid) : '';
      var data = 'queryName=MESSAGE_THREAD_IMAGES_FIRST'+after+'&params[first]=19&params[thread_id]='+g.threadId+'&__user='+g.Env.user+'&__a=1&__req=7&fb_dtsg='+g.fb_dtsg;
      xhr.send(data);
    }else{
      if(g.ajaxRetry[fbid] > 3){
        g.photodata.photos.push({
          href: '',
          url: elms.url
        });
      }
      g.ajaxLoaded++;
      fbAjaxAttachment();
    }
  }else if(g.photodata.photos.length){
    output();
  }
}
function getFbMessages(){
  g.photodata.aName = getText('#webMessengerHeaderName');
  g.photodata.aDes = qS('#webMessengerHeaderName').innerHTML;
  g.fb_dtsg = qS('[name=fb_dtsg]').value;
  var threadId = location.href.match(/conversation-(\d+)/);
  var userId = qS('#webMessengerHeaderName a');
  var data;
  if(threadId){
    threadId = threadId[1];
    data = 'messages[thread_fbids]['+threadId+'][offset]=0&messages[thread_fbids]['+threadId+'][limit]=21';
  }else if(userId){
    userId = userId.getAttribute('data-hovercard').match(/id=(\d+)&/)[1];
    data = 'messages[user_ids]['+userId+'][offset]=0&messages[user_ids]['+userId+'][limit]=21';
  }else{
    alert('Cannot get message info.');
    return;
  }
  data += '&&client=web_messenger&__user='+g.Env.user+'&__a=1&__req=7&fb_dtsg='+g.fb_dtsg;
  var url = 'https://www.facebook.com/ajax/mercury/thread_info.php';
  var xhr = new XMLHttpRequest();
  xhr.onload = function(){
    console.log('getFbMessages', JSON.parse(this.response.slice(9)));
    return;
    var elms = [];
    var payload = JSON.parse(this.response.slice(9)).payload;
    if(payload.actions){
      payload = payload.actions;
      var i, j, attachments, photo;
      for(i = 0; i < payload.length; i++){
        attachments = payload[i].attachments;
        for(j = 0; j < attachments.length; j++){
          if(typeof attachments[j] == 'object' && attachments[j].attach_type == 'photo'){
            elms.push(attachments[j].url);
            break;
          }
        }
      }
      if(elms.length){
        g.elms = elms;
        fbLoadAttachment();
      }else{
        alert('No photo attachments found.');
      }
    }
  };
  xhr.open('POST', url);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send(data);
}
function fbLoadAttachment(){
  if(g.elms.length){
    var url = g.elms.shift();
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
      console.log('fbLoadAttachment', this);
      var i, elms = [];
      var require = JSON.parse(this.response.slice(9)).jsmods.require[0][3][1];
      var images = require.query_results.message_thread.message_images.edges;
      for(i = 0; i < images.length; i++){
        g.photodata.photos.push({
          href: '',
          url: images[i].node.image2.uri
        });
      }
      fbLoadAttachment();
    };
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var data = '__user='+g.Env.user+'&__a=1&__req=7&fb_dtsg='+g.fb_dtsg;
    xhr.send(data);
  }else{
    if(g.photodata.photos.length){
      output();
    }
  }
}
function fbLoadPage(posted) {
  var xhr = new XMLHttpRequest();
  var key = posted ? '_posted_photos1B25GG' : '_photos_by_others4vtdVT';
  var type = posted ? 'PagePhotosTabAllPhotosView_react_PageRelayQL' :
    'MediaPageRoute';
  xhr.onload = function() {
    var r = extractJSON(this.responseText);
    var d = r.q0.response[g.pageId][key];
    var images = d.edges, img, e = [];
    var doc = document.createElement('div');
    for (var i = 0; i < images.length; i++) {
      img = images[i].node;
      doc.innerHTML = '<a href="' + img.url + '" rel="theater">' +
        '<img src="' + img._image1LP0rd.url + '" alt></a>';
      e.push(doc.childNodes[0].cloneNode(true));
      g.last_fbid = img.id;
    }
    g.elms = g.elms.concat(e);

    var t = g.statusEle;
    if(!t.nextElementSibling){var stopBtn=document.createElement('label');stopBtn.id='stopAjax';stopBtn.innerHTML='<a class="navItem"> | Stop</a><input id="stopAjaxCkb" type="checkbox">';t.parentNode.appendChild(stopBtn);}
    t.textContent = 'Loading album... (' + g.elms.length + ')';
    document.title = '(' + g.elms.length + ') ||' + g.photodata.aName;

    if (d.page_info.has_next_page && !qS('#stopAjaxCkb').checked) {
      setTimeout(fbLoadPage, 1000);
    } else {
      console.log('Loaded ' + g.elms.length + ' photos.');
      g.lastLoaded = 1;
      setTimeout(getPhotos, 1000);
    }
  }
  xhr.open('POST', 'https://www.facebook.com/api/graphqlbatch/');
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  var q = JSON.stringify({q0 : {
    priority: 0,
    q: 'Query ' + type + ' {node(' + g.pageId +
      ') {@F3}} QueryFragment F0 : Feedback {does_viewer_like,id} ' +
      'QueryFragment F1 : Photo {id,album {id,name},feedback ' +
      '{id,can_viewer_comment,can_viewer_like,likers {count},' +
      'comments {count},@F0}} QueryFragment F2 : Photo {image.sizing(' +
      'cover-fill-cropped).height(201).width(201) as _image1LP0rd {uri}' +
      ',url,id,@F1} QueryFragment F3 : ' +
      'Page {id,posted_photos.after(' + g.last_fbid +
      ').first(28) as ' + key + ' {edges {node {id,@F2},cursor},' +
      'page_info {has_next_page,has_previous_page}}}',
    query_params: {}
  }});
  var data = '__user=' + g.Env.user + '&method=GET&response_format=json' +
    '&fb_dtsg=' + g.fb_dtsg + '&batch_name=' + type + '&queries=' + q;
  xhr.send(data);
}
function fbAutoLoadFailed(){
  if(confirm('Cannot load required variable, refresh page to retry?')){
    location.reload();
  }else{
    g.lastLoaded=1;getPhotos();
  }
}
function fbAutoLoad(elms){
  var l; if(g.ajaxStartFrom){
    elms = [];
    g.elms = [];
    l = g.ajaxStartFrom;
  }else{
    for(var i = elms.length - 1; i > elms.length - 5 && !l; i--){
      l = getFbid(elms[i].href);
    }
    if(!l){
      alert("Autoload failed!");g.lastLoaded=1;getPhotos();
      return;
    }
  }
  var ajaxAlbum = '', targetURL, tab, pType;
  if(!g.last_fbid){
    g.last_fbid = l;
  }else if(g.last_fbid==l){
    if(g.ajaxRetry<5){l=elms[elms.length-2].href;l=l.slice(l.indexOf('=')+1,l.indexOf('&'));g.ajaxRetry++;}
    else if(confirm('Reaches end of album / Timeouted.\nTry again->OK\nOutput loaded photos->Cancel')){g.ajaxRetry=0;}else{g.lastLoaded=1;getPhotos();return;}
  }else{
    g.last_fbid=l;
  }
  var p=location.href+'&';var isAl=p.match(/media\/set|media|set=a/),aInfo={},isPS=p.match(/photos_stream/),isGp=p.match(/group/),isGraph=p.match(/search/);
  var isPage = qS('[aria-labelledby="pages_name"]');
  if (isPage) {
    var pageId = qS('.profilePicThumb');
    if (pageId){
      g.pageId = pageId.getAttribute('href').split('/')[3].split('.')[3];
    } else {
      pageId = qS('[property="al:ios:url"]');
      if (pageId){
        g.pageId = pageId.getAttribute('content').split('/')[3].split('=')[1];
      } else {
        fbAutoLoadFailed();
        return;
      }
    }
    if (p.match(/album_id=/)) {
      isAl = true;
      p = qS('.uiMediaThumb').getAttribute('href').split('/')[3];
      aInfo = {"scroll_load":true,"last_fbid":l,"fetch_size":32,"profile_id":g.pageId,"viewmode":null, "set":p,"type":"1"};
    } else {
      var s = qSA('script');
      for (var i = 0; i < s.length; i++) {
        if (s[i].textContent.indexOf('DTSGInitialData') > 0) {
          s = s[i].textContent;
          break;
        }
      }
      s = s.slice(s.indexOf('DTSGInitialData'));
      s = s.slice(0, s.indexOf('}')).split('"');
      if (!s.length || !s[4]) {
        fbAutoLoadFailed();
        return;
      }
      g.fb_dtsg = s[4];
      g.elms = Array.prototype.slice.call(elms, 0);
      fbLoadPage(g.pagePosted);
      return;
    }
  }
  if(isGp){
    p=elms[0].href.split('&')[1];p=p.slice(p.indexOf('.')+1);
    aInfo={"scroll_load":true,"last_fbid":l,"fetch_size":108,"group_id":p};
  }else if(isAl){
    if (!isPage) {
      p=p.match(/set=([a\.\d]*)&/)[1] || p.slice(p.indexOf('=')+1,p.indexOf('&'));
      aInfo={"scroll_load":true,"last_fbid":l,"fetch_size":32,"profile_id":+p.slice(p.lastIndexOf('.')+1),"viewmode":null,"set":p,"type":"1"};
    }

    var token = qS("div[aria-role='tabpanel']");
    if (token && token.id) {
      token = token.id.split("_")[4];
      var user = token.split(':')[0];
      var tnext = qS('.fbPhotoAlbumTitle').nextSibling;
      var isCollab = tnext.className != 'fbPhotoAlbumActions' &&
        tnext.querySelectorAll('[data-hovercard]').length > 1;
      
      if (location.href.match(/collection_token/) || isCollab) {
        aInfo.collection_token = token;
        aInfo.profile_id = user;
      }
    }
  }else if(isGraph){
    var query = {};
    if(!g.query){
      var s=qSA("script"), temp=[];
      for(var i=0;i<s.length;i++){
        if (s[i].textContent.indexOf('encoded_query') > 0) {
          temp[0] = s[i].textContent;
        }
        if(s[i].textContent.indexOf('cursor:"') > 0) {
          temp[1] = s[i].textContent;
        }
      }
      query = temp[0];
      var cursor = temp[1];
      query = extractJSON(query);
      cursor = extractJSON(cursor);
      if (!query || !cursor) {
        fbAutoLoadFailed();
        return;
      }
      var rq = query.jsmods.require;
      for(i=0; i<rq.length; i++){
        if(rq[i][0] == "BrowseScrollingPager"){
          query = rq[i][3][1];
          break;
        }
      }
      rq = cursor.jsmods.require;
      for(i=0; i<rq.length; i++){
        if(rq[i][0] == "BrowseScrollingPager"){
          cursor = rq[i][3][0].cursor;
          break;
        }
      }
      query.cursor = cursor;
      query.ads_at_end = false;
      g.query = query;
    }else{
      query = g.query;
      query.cursor = g.cursor;
    }
    aInfo = query;
  }else if(!g.newL){
    var ele = qS('#pagelet_timeline_main_column');
    if (ele) {
      p = JSON.parse(ele.dataset.gt).profile_owner;
    } else if (ele = qS('#pagesHeaderLikeButton [data-profileid]')) {
      p = ele.dataset.profileid;
    } else {
      alert('Cannot get profile id!');
      return;
    }
    aInfo={"scroll_load":true,"last_fbid":l,"fetch_size":32,"profile_id":+p,"tab_key":"photos"+(isPS?'_stream':''),"sk":"photos"+(isPS?'_stream':'')};
  }else{
    p = qS('#pagelet_timeline_medley_photos a[aria-selected="true"]').getAttribute('aria-controls').match(/.*_(.*)/)[1];
    var userId = p.match(/(\d*):.*/)[1];
    tab = p.split(':')[2];
    if(qS('.hidden_elem .fbStarGrid')){
      var t=qS('.hidden_elem .fbStarGrid');t.parentNode.removeChild(t);getPhotos();return;
    }
    aInfo={"scroll_load":true,"last_fbid":l,"fetch_size":32,"profile_id":userId,"tab_key":"photos"+(tab==5?'_stream':''),"sk":"photos"+(tab==5?'_stream':'')};
  }
  if(isGraph){
    ajaxAlbum='https://www.facebook.com/ajax/pagelet/generic.php/BrowseScrollingSetPagelet?data='+escape(JSON.stringify(aInfo))+'&__user='+g.Env.user+'&__a=1';
  }else if(!g.newL || isGp || isAl){
    targetURL=(isGp?'GroupPhotoset':'TimelinePhotos'+(isAl?'Album':(isPS?'Stream':'')));
    ajaxAlbum='https://www.facebook.com/ajax/pagelet/generic.php/'+targetURL+'Pagelet?ajaxpipe=1&ajaxpipe_token='+g.Env.ajaxpipe_token+'&no_script_path=1&data='+JSON.stringify(aInfo)+'&__user='+g.Env.user+'&__a=1&__adt=2';
  }else{
    var req = 5+(qSA('.fbStarGrid>div').length-8)/8*2
    tab=qSA('#pagelet_timeline_medley_photos a[role="tab"]');
    pType = +p.split(':')[2];
    targetURL = "";
    switch(pType){
      case 4: targetURL = 'TimelinePhotos'; break;
      case 5: targetURL = 'TimelinePhotosStream'; break;
      case 70: targetURL = "UntaggedPhotosAppCollection";
      cursor = btoa('0:not_structured:'+l);
      aInfo = {"collection_token": p, "cursor": cursor, "tab_key": "photos_untagged","profile_id": +userId,"overview":false,"ftid":null,"sk":"photos"}; break;
    }
    ajaxAlbum='https://www.facebook.com/ajax/pagelet/generic.php/'+targetURL+'Pagelet?data='+escape(JSON.stringify(aInfo))+'&__user='+g.Env.user+'&__a=1';
  }
  var xhr = new XMLHttpRequest();
  xhr.onload = function(){
    clearTimeout( g.timeout );
    if(this.status!=200){
      if(!confirm('Autoload failed.\nTry again->OK\nOutput loaded photos->Cancel')){g.lastLoaded=1;}getPhotos();return;
    }
    var r=this.response,htmlBase=document.createElement('html');
    var newL = r.indexOf('for')==0;

    var eCount = 0, e, old;
    if(!newL){
      htmlBase.innerHTML=r.slice(6,-7);
      var targetJS=htmlBase.querySelectorAll('script');
      for(var k=0;!newL && k<targetJS.length;k++){
        var t=targetJS[k].textContent,content=t.slice(t.indexOf(', {')+2,t.indexOf('}, true);}')+1);
        if(!content.length||t.indexOf('JSONPTransport')<0){continue;}
        content=JSON.parse(content);
        var d=document.createElement('div');
        d.innerHTML=content.payload.content.content;
        e=d.querySelectorAll(g.thumbSelector);
        if(!e||!e.length)continue;
        eCount+=e.length;
        old=elms?Array.prototype.slice.call(elms,0):'';
        g.elms=old?old.concat(Array.prototype.slice.call(e,0)):e;
      }
    }else{
      htmlBase.innerHTML = JSON.parse(r.slice(9)).payload;
      var e = [], temp = [];
      if(g.query){
        temp = htmlBase.querySelectorAll('a[rel="theater"]');
        for(k = 0; k < temp.length; k++){
          if (temp[k].querySelector('img')) {
            e.push(temp[k]);
          }
        }
        temp = [];
        if(e.length)g.cursor = parseQuery(e[e.length-1].href).opaqueCursor;
      }else{
        e = htmlBase.querySelectorAll(g.thumbSelector);
      }
      var map = {};
      for(k = 0; k < e.length; k++){
        if(!map[e[k].href]){
          map[e[k].href] = 1;
          temp.push(e[k]);
        }
      }
      e = temp;
      eCount+=e.length;
      old=elms?Array.prototype.slice.call(elms,0):'';
      g.elms=old?old.concat(Array.prototype.slice.call(e,0)):e;
    }
    t=g.statusEle;
    if(!t.nextElementSibling){var stopBtn=document.createElement('label');stopBtn.id='stopAjax';stopBtn.innerHTML='<a class="navItem"> | Stop</a><input id="stopAjaxCkb" type="checkbox">';t.parentNode.appendChild(stopBtn);}
    t.textContent='Loading album... ('+g.elms.length+')';
    document.title='('+g.elms.length+') ||'+g.photodata.aName;

    if(!eCount){console.log('Loaded '+g.elms.length+' photos.');g.lastLoaded=1;}
    if (g.ajaxStartFrom) {
      g.ajaxStartFrom = false;
    }
    setTimeout(getPhotos,1000);
  };
  xhr.open("GET", ajaxAlbum);
  g.timeout=setTimeout(function(){
    xhr.abort();
    if(g.ajaxRetry>5){if(confirm('Timeout reached.\nTry again->OK\nOutput loaded photos->Cancel')){g.ajaxRetry=0;}else{g.lastLoaded=1;}}getPhotos();
  },10000);
  xhr.send();
}
function getAlbums(){
  var k=qSA(".uiMediaThumbAlb");
  for(var i=0,t;t=k[i];++i){
    t.parentNode.innerHTML='<input class="albSelect'+i+'" type="checkbox" />'+t.parentNode.innerHTML
  }
}
function instaAjax(){
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var total=g.total, photodata=g.photodata,
    res=JSON.parse(this.response),elms=res.items;
    if(elms[0].id.indexOf('_')<0)elms=elms[3];
    g.ajax=res.more_available?elms[elms.length-1].id:null;
    for(var i=0;i<elms.length;i++){
      var url = parseFbSrc(elms[i].images.standard_resolution.url);
      var c = elms[i].comments, cList = [c.count];
      for(var k=0; k<c.data.length; k++){
        var p = c.data[k];if(p){
        cList.push({name: p.from.full_name || p.from.username, url: 'http://instagram.com/'+p.from.username, text: p.text, date: parseTime(p.created_time), id: elms[i].link});}
      }
      if(elms[i].videos){
        photodata.videos.push({
          url: elms[i].videos.standard_resolution.url,
          thumb: url
        });
      }
      photodata.photos.push({
        title: elms[i].caption?elms[i].caption.text:'',
        url: url,
        href: elms[i].link,
        date: elms[i].created_time?parseTime(elms[i].created_time):'',
        comments: c.count?cList:''
      });
    }
    console.log('Loaded '+photodata.photos.length+' of '+total+' photos.');
    if(!g.status.e.nextElementSibling){var stopBtn=document.createElement('label');stopBtn.id='stopAjax';stopBtn.innerHTML='<a class="navItem"> | Stop</a><input id="stopAjaxCkb" type="checkbox">';g.status.e.parentNode.appendChild(stopBtn);}
    g.status.e.textContent='Loaded '+g.photodata.photos.length+' / '+total;
    document.title="("+g.photodata.photos.length+"/"+total+") ||"+g.photodata.aName;
    if(qS('#stopAjaxCkb')&&qS('#stopAjaxCkb').checked){output();}
    else if(total>photodata.photos.length&&g.ajax){instaAjax();}else{output();}
  };
  xhr.open("GET", 'https://www.instagram.com/'+g.Env.user.username+'/media/?max_id='+g.ajax);
  xhr.send();
}
function buildIgQuery(max_id, loadCm) {
  var comments = '';
  if (loadCm) {
    comments = 'comments { count, nodes{created_at, text, user{username}} }, ';
  }
  return 'q=ig_user(' + g.Env.user.id + ') {media.after(' + max_id + ', 33) ' +
    '{count, nodes {caption, code, ' + comments + 'date, display_src, id, ' +
    'is_video, likes {count}, video_url }, page_info } }&ref=users%3A%3Ashow';
}
function _instaQueryAdd(elms) {
  for (var i = 0; i < elms.length; i++) {
    var url = parseFbSrc(elms[i].display_src);
    if (g.loadCm) {
      var c = elms[i].comments, cList = [c.count];
      if (c.nodes) {
        for(var k = 0; k < c.nodes.length; k++){
          var p = c.nodes[k];
          if (p) {
            cList.push({
              name: p.user.username,
              url: 'http://instagram.com/' + p.user.username,
              text: p.text,
              date: parseTime(p.created_at)
            });
          }
        }
      }
    }
    if(elms[i].is_video){
      g.photodata.videos.push({
        url: elms[i].video_url,
        thumb: url
      });
    }
    g.photodata.photos.push({
      title: elms[i].caption || '',
      url: url,
      href: 'https://www.instagram.com/p/' + elms[i].code + '/',
      date: elms[i].date ? parseTime(elms[i].date) : '',
      comments: g.loadCm && c.nodes ? cList : ''
    });
  }
}
function instaQueryInit() {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var res = {};
    try {
      res = JSON.parse(this.response);
    } catch(e) {
      alert('Fallback to old api!');
    }
    if (res.media) {
      _instaQueryAdd([res.media]);
      instaQuery();
    } else {
      g.ajax = '';
      instaAjax();
    }
  };
  xhr.open('GET', 'https://www.instagram.com/p/' + g.Env.media[0].code +
    '/?__a=1');
  xhr.send();
}
function instaQuery() {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if (this.response[0] == '<') {
      if (confirm('Cannot load comments, continue?')) {
        g.loadCm = false;
        instaQuery();
      }
      return;
    }
    var total=g.total, photodata=g.photodata,
    res=JSON.parse(this.response),elms=res.media.nodes;
    g.ajax = res.media.page_info.has_next_page ? elms[elms.length-1].id : null;
    _instaQueryAdd(elms);
    console.log('Loaded '+photodata.photos.length+' of '+total+' photos.');
    if(!g.status.e.nextElementSibling){var stopBtn=document.createElement('label');stopBtn.id='stopAjax';stopBtn.innerHTML='<a class="navItem"> | Stop</a><input id="stopAjaxCkb" type="checkbox">';g.status.e.parentNode.appendChild(stopBtn);}
    g.status.e.textContent='Loaded '+g.photodata.photos.length+' / '+total;
    document.title="("+g.photodata.photos.length+"/"+total+") ||"+g.photodata.aName;
    if(qS('#stopAjaxCkb')&&qS('#stopAjaxCkb').checked){output();}
    else if(total>photodata.photos.length&&g.ajax){instaQuery();}else{output();}
  };
  xhr.open('POST', 'https://www.instagram.com/query/');
  xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader('X-CSRFToken', g.token);
  xhr.setRequestHeader('X-Instagram-Ajax', 1);
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.send(buildIgQuery(g.ajax, g.loadCm));
}
function getInstagram(){
  if(g.start!=2||g.start==3){return;}g.start=3;
  var i, elms = g.Env.media, photodata = g.photodata, url;
  if (g.Env.user.biography !== undefined && (g.mode!=2 || g.loadCm)) {
    g.ajax = g.Env.media[0].id;
    g.loadCm = false;
    instaQueryInit();
  } else {
    for(i=0;i<elms.length;i++){
      var c = elms[i].comments;
      if (elms[i].images || elms[i].videos) {
        url = parseFbSrc(elms[i].images.standard_resolution.url);
        g.stored.push(url);
        var cList = [c.count];
        for(var j=0; j<c.data.length; j++){
          var p = c.data[j];if(p){
          cList.push({name: p.from.full_name || p.from.username, url: 'http://instagram.com/'+p.from.username, text: p.text, date: parseTime(p.created_time), id: elms[i].link});}
        }
        if(elms[i].videos){
          photodata.videos.push({
            url: elms[i].videos.standard_resolution.url,
            thumb: url
          });
        }
      } else {
        url = parseFbSrc(elms[i].display_src);
        g.stored.push(url);
      }
      var date = elms[i].date || elms[i].created_time;
      photodata.photos.push({
        title: elms[i].caption?elms[i].caption.text:'',
        url: url,
        href: elms[i].link,
        date: date ? parseTime(date) : '',
        comments: c.count?cList:''
      });
    }
    var elms2=qSA('li.photo');
    if(elms2&&!g.loadCm){ for(i=photodata.photos.length;i<elms2.length;i++){
      var e = elms2[i].querySelector('.Image');
      if(e){
        url = parseFbSrc(e.style.backgroundImage.slice(4,-1).replace('6.jpg','7.jpg'));
        g.stored.push(url);
        photodata.photos.push({
          title: '',
          url: url,
          date: elms2[i].querySelector('.photo-date').textContent,
          href: elms2[i].querySelector('a').href||''
        });
      }
    }}else if(g.mode==2&&elms2&&g.loadCm){g.total=elms2.length;}
    if((g.mode!=2||g.loadCm)&&photodata.photos.length!=g.total){g.ajax=elms[elms.length-1].id;instaAjax();}else{output();}
  }
}
function getFlickr(){
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if(this.status!=200){
      console.log(this);return;
    }
    var r=this.response, d=JSON.parse(r.slice(14,-1)), p=d.photoset.photo, len=p.length;
    //console.log(d);
    // todo: add handle for pages > 1
    for(var i=0, k=p[i] ; i<len ; i++, k=p[i]){
      g.photodata.photos.push({
        title: '',
        url: k.url_o,
        href: g.linkPrefix+k.id,
        date: k.datetaken||k.dateupload
      });
    }
    output();
  };
  // Need a api key from page or own(may be risky)
  xhr.open('GET','http://www.flickr.com/services/rest/?format=json&api_key=086959117ee519c56c2d062b57a2f909&photoset_id='+location.href.match(/\/sets\/(.*)\//)[1]+'&extras=url_o%2Cdate_upload%2Cdate_taken&method=flickr.photosets.getPhotos');
  xhr.send();
}
function getWeibo(){
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    g.ajaxPage++;
    var r = this.response;
    var s = r.slice( r.indexOf("{"),r.lastIndexOf("}")+1 );
    var res = new Function("return " + s)().data;
    var elms = res.html;
    var photodata=g.photodata;
    var html;
    g.ajax=res.lastMid || null;
    for(var i=0;elms&&i<elms.length;i++){
      html = document.createElement("div");
      html.innerHTML = elms[i];
      var links = html.querySelectorAll("a.ph_ar_box");
      var img = html.querySelectorAll("img.photo_pic");
      var title = html.querySelector(".describe span").title || '';
      var photoTime = html.querySelector(".photo_time").textContent || '';
      for(var imgCount = 0; imgCount < img.length; imgCount++){
        var data = {};
        var link = links[imgCount].getAttribute("action-data").split("&");
        for(var j=0; j<link.length; j++){
          var t = link[j].split("=");
          data[t[0]] = t[1];
        }
        var url = img[imgCount].src.match(/http:\/\/([\w\.]+)\//);
        url = 'http://' + url[1] + '/large/' + data.pid + '.jpg';
        if(!g.downloaded[url]){g.downloaded[url]=1;}else{continue;}
        var photoId = unescape(data.pic_objects).split('|')[0] || data.mid;
        photodata.photos.push({
          title: title,
          url: url,
          href: 'http://photo.weibo.com/'+g.uId+'/talbum/detail/photo_id/'+photoId,
          date: photoTime
        });
      }
    }
    console.log('Loaded '+photodata.photos.length+' photos.');
    document.title="("+g.photodata.photos.length+") ||"+g.photodata.aName;
    if(!qS('#stopAjaxCkb')){var stopBtn=document.createElement('li');stopBtn.id='stopAjax';stopBtn.innerHTML='Stop <input id="stopAjaxCkb" type="checkbox">';qS('.gn_topmenulist ul').appendChild(stopBtn);}
    if(qS('#stopAjaxCkb')&&qS('#stopAjaxCkb').checked){output();}
    else if(g.ajax){setTimeout(getWeibo, 2000);}else{output();}
  };
  xhr.open("GET", "http://photo.weibo.com/page/waterfall?filter=wbphoto&page="+g.ajaxPage+"&count=20&module_id=profile_photo&oid="+g.oId+"&uid=&lastMid="+g.ajax+"&lang=zh-tw");
  xhr.send();
}
function getTwitter(){
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var r = JSON.parse(this.responseText);
    g.ajax = r.min_position || '';
    var doc = getDOM(r.items_html);
    var elms = doc.querySelectorAll('.content');
    var photodata = g.photodata;
    var i, j, link, url, title, date;
    for(i = 0; i < elms.length; i++){
      link = elms[i].querySelectorAll('.js-adaptive-photo, [data-image-url]');
      if (!link.length) {
        link = elms[i].querySelectorAll('img[src*=media]');
      }
      for(j = 0; j < link.length; j++){
        url = link[j].getAttribute('data-image-url') || link[j].src;
        if (!url) {
          continue;
        }
        title = elms[i].querySelector('.tweet-text').innerHTML || '';
        title = title.replace(/href="\//g, 'href="https://twitter.com/');
        date = elms[i].querySelector('._timestamp, .js-short-timestamp');
        photodata.photos.push({
          title: title,
          url: url.replace(':large', '') + ':orig',
          href: link[j].getAttribute('href'),
          date: date ? parseTime(+date.getAttribute('data-time')) : '' 
        });
        if (!r.min_position) {
          var max_id = (date.parentNode.getAttribute('href') || '')
            .match(/status\/(\d+)/);
          if(max_id){
            g.ajax = max_id[1];
          }
        }
      }
    }
    console.log("Loaded", photodata.photos.length);
    if (!qS('#stopAjaxCkb')) {
      var stopBtn = document.createElement('ul');
      stopBtn.id = 'stopAjax';
      stopBtn.className = 'nav secondary-nav';
      stopBtn.innerHTML = '<span class="dfaCounter"></span>|| <a>Stop <input id="stopAjaxCkb" type="checkbox"></a>';
      qS('.topbar .pull-right').appendChild(stopBtn);
    }
    document.title = photodata.photos.length + g.total + ' || ' + g.photodata.aName;
    qS('.dfaCounter').textContent = g.photodata.photos.length + g.total;
    if (qS('#stopAjaxCkb') && qS('#stopAjaxCkb').checked) {
      output();
    } else if (r.has_more_items && g.ajax && !g.ajaxStop) {
      setTimeout(getTwitter, 1000);
    } else {
      output();
    }
  };
  var url = 'https://twitter.com/i/profiles/show/'+g.photodata.aName+'/media_timeline?include_available_features=1&include_entities=1' + (g.ajax ? ('&max_position='+g.ajax) : '');
  xhr.open('GET', url);
  xhr.send();
}
function parsePinterest(list){
  var photodata = g.photodata;
  for(var j = 0; j < list.length; j++){
    if (list[j].name) {
      continue;
    }
    photodata.photos.push({
      title: list[j].description + '<br><a taget="_blank" href="' + 
        list[j].link + '">Pinned from ' + list[j].domain + '</a>',
      url: list[j].images.orig.url,
      href: 'https://www.pinterest.com/pin/' + list[j].id + '/',
      date: new Date(list[j].created_at).toLocaleString()
    });
  }
  console.log('Loaded ' + photodata.photos.length + ' photos.');
}
function getPinterest(){
  var board = location.pathname.match(/\/(\S+)\/(\S+)\//);
  if(board){
    // User's board
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var html = this.response;
      var doc = getDOM(html);
      var s = doc.querySelectorAll('script');
      for (var i = 0; i < s.length; i++) {
        if (!s[i].src && s[i].textContent.indexOf('bookmarks":["') > 0) {
          s = s[i].textContent;
          break;
        }
      }
      var r = JSON.parse(s);
      var d = r.tree.children;
      for (i = 0; i < d.length; i++) {
        if (d[i].name == 'BoardPage') {
          break;
        }
      }
      d = d[i].children;
      for (i = 0; i < d.length; i++) {
        if (d[i].name == 'Grid') {
          parsePinterest(d[i].data);
          g.bookmarks = d[i].resource.options;
          g.options = d[i].options;
        }
      }
      getPinterest_sub();
    };
    xhr.open('GET', location.href);
    xhr.send();
  }else{
    // Own Feed

  }
}
function getPinterest_sub(){
  var photodata = g.photodata;
  var board = location.pathname.match(/\/(\S+)\/(\S+)\//);
  if(board){
    // User's board
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var r = JSON.parse(this.responseText);
      // console.log(r);
      var d = r.module.tree;
      parsePinterest(d.data);
      g.options = d.options;
      g.bookmarks = d.resource.options;

      document.title="("+g.photodata.photos.length+") ||"+g.photodata.aName;
      if(!qS('#stopAjaxCkb')){var stopBtn=document.createElement('button');stopBtn.id='stopAjax';stopBtn.innerHTML='<span class="dfaCounter"></span>|| Stop <input id="stopAjaxCkb" type="checkbox">';qS('.boardButtons').appendChild(stopBtn);}
      qS('.dfaCounter').textContent = g.photodata.photos.length + '/' + getText('.pinsAndFollowerCount .value');
      if(qS('#stopAjaxCkb')&&qS('#stopAjaxCkb').checked){output();}
      else if(g.bookmarks.bookmarks[0] != '-end-'){
        getPinterest_sub();
      }else{
        output();
      }
    };
    var data = {
      "options" : g.bookmarks,
      "context": {},
      "module": {
        "name": "GridItems",
        "options": g.options
      },
      "module_path": "Button(class_name=primary, text=Close)"
    };
    var url = 'https://www.pinterest.com/resource/BoardFeedResource/get/';
    var data = 'source_url=' + 
      encodeURIComponent('/' + board[1] + '/' + board[2] + '/') + 
      '&data=' + escape(JSON.stringify(data)) + '&_=' + (+new Date());
    xhr.open('POST', url);
    xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var token = g.token || document.cookie.match(/csrftoken=(\S+);/)
    if(token){
      if(!g.token){
        token = token[1];
        g.token = token;
      }
      xhr.setRequestHeader('X-CSRFToken', token);
      xhr.setRequestHeader('X-NEW-APP', 1);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.send(data);
    }else{
      alert('Missing token!');
    }
  }else{
    // Own Feed
  }
}
function getAskFM() {
  var url = 'https://ask.fm/' + g.username + '/answers/more?page=' + g.page;
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var html = getDOM(this.response);
    var hasMore = html.querySelector('.viewMore');
    var elms = html.querySelectorAll('img');
    var i, box, link, title, url, video;
    var photodata = g.photodata;
    for (var i = 0; i < elms.length; i++) {
      box = getParent(elms[i], '.item');
      if (box.className == 'viewMore') {
        continue;
      }
      video = box.querySelector('video');
      if (video) {
        url = elms[i].src;
        photodata.videos.push({
          url: video.src,
          thumb: url
        });
      } else {
        url = elms[i].parentNode.getAttribute('data-url') ||
          elms[i].getAttribute('data-src');
      }
      link = box.querySelector('.streamItemsAge');
      title = 'Q: ' +  
        getText('.streamItemContent-question', 0, box) +
        ' <br>' + 'A: ' + getText('.streamItemContent-answer', 0, box);
      photodata.photos.push({
        title: title,
        url: url,
        href: 'https://ask.fm' + link.getAttribute('href'),
        date: link.getAttribute('data-hint')
      });
    }
    console.log('Loaded ' + photodata.photos.length + ' photos.');
    g.count += html.querySelectorAll('.item').length;
    g.status.textContent =  g.count + '/' + g.total;
    document.title = g.status.textContent + ' ||' + g.title;
    if (g.count < g.total && hasMore && !qS('#stopAjaxCkb').checked) {
      g.page++;
      setTimeout(getAskFM, 500);
    } else {
      if (photodata.photos.length) {
        output();
      } else {
        alert('No photos loaded.');
      }
    }
  };
  xhr.open('GET', url);
  xhr.send();
}

(function() {
  g.start = 1;
  var pageSetting = qS('#fbDown');
  if(pageSetting){
    var setting = pageSetting.textContent.split(',');
    g.mode = setting[0];
    g.loadCm = (setting[1].length>0);
    g.notLoadCm = !g.loadCm;
    g.largeAlbum = (setting[2].length>0);
    g.newLayout = (setting[3].length>0);
  }
  g.mode = g.mode || window.prompt('Please type your choice:\nNormal: 1/press Enter\nDownload without auto load: 2\nAutoload start from specific id: 3\nOptimization for large album: 4');
  if(g.mode==4){g.largeAlbum=true;g.mode=window.prompt('Please type your choice:\nNormal: 1/press Enter\nDownload without auto load: 2\nAutoload start from specific id: 3');}
  if(g.mode==null){return;}
  if(g.mode==3){g.ajaxStartFrom=window.prompt('Please enter the id:\ni.e. 123456 if photo link is:\nfacebook.com/photo.php?fbid=123456');if(!g.ajaxStartFrom){return;}}
  /*if(g.mode==4){
    var t=qS('#globalContainer');
    var k=document.createElement('div');
    k.id='DownFbDebug';k.style.border='5px red solid';
    url=unescape(qS('a:not(.notifMainLink):not(.hidden_elem):not(.egoPhotoImage):not(.uiBlingBox):not(.tickerFullPhoto)[rel="theater"][ajaxify]').getAttribute('ajaxify'));url.slice(url.indexOf('&src=')+5,url.indexOf('&smallsrc'));
    k.innerHTML='<br><br><br><br>Download FB Album Debug info:<br>'+url+'<br><br><br><a onClick=\'(function(){var t=qS("#DownFbDebug");t.parentNode.removeChild(t);})()\'>Close this</a>';
    t.parentNode.insertBefore(k,t);return;
  }
  if(g.mode==5){try{chrome.extension.sendMessage({type:'export'});}catch(e){chrome.extension.sendRequest({type:'export'});}return;}*/
  /*if(g.get){
  g.last=1;
  chrome.extension.onRequest.addListener(function(a){
    if(!g.photodata){g.start=2;
    g.photodata=JSON.parse(unescape(a));
    console.log(g.photodata.photos.length+' photos got.');
    getPhotos();}
  });
  chrome.extension.sendRequest({type:'get'});
  }else{*/
  var aName=document.title,aAuth="",aDes="",aTime="", s, i, t, env, len;g.start=2;
  g.timeOffset=new Date().getTimezoneOffset()/60*-3600000;
  if(location.href.match(/.*facebook.com/)){
    if(qS('.fbPhotoAlbumTitle')||qS('.fbxPhotoSetPageHeader')){
    aName=getText('.fbPhotoAlbumTitle')||getText("h2")||document.title;
    aAuth=getText('#fb-timeline-cover-name')||getText("h2")||getText('.fbStickyHeaderBreadcrumb .uiButtonText')||getText(".fbxPhotoSetPageHeaderByline a");
    if(!aAuth){aName=getText('.fbPhotoAlbumTitle'); aAuth=getText('h2');}
    aDes=getText('.fbPhotoCaptionText',1);
    try{aTime=qS('#globalContainer abbr').title;
    var aLoc=qS('.fbPhotoAlbumActionList').lastChild;
    if((!aLoc.tagName||aLoc.tagName!='SPAN')&&(!aLoc.childNodes.length||(aLoc.childNodes.length&&aLoc.childNodes[0].tagName!='IMG'))){aLoc=aLoc.outerHTML?" @ "+aLoc.outerHTML:aLoc.textContent;aTime=aTime+aLoc;}}catch(e){}
    }
    if(location.href.match('/search/')){
      var query = qS('input[name="q"]');
      aName = query ? query.value : document.title;
    }
    s = qSA("script");
    try{
      for(i=0,t, len = s.length; t=s[i].textContent, i<len; i++){
        if(t.match(/envFlush\({/)){
          g.Env=JSON.parse(t.slice(t.lastIndexOf("envFlush({")+9,-2)); break;
        }
      }
    }catch(e){alert('Cannot load required variable');}
    try{
      for(i=0; t=s[i].textContent, i<len; i++){
        var m = t.match(/"USER_ID":"(\d+)"/);
        if(m){
          g.Env.user = m[1]; break;
        }
      }
    }catch(e){console.warn(e);alert('Cannot load required variable');}
    if (!g.loadCm) {
      g.loadCm = confirm('Load caption to correct photos url?');
      g.notLoadCm = !g.loadCm;
    }
    g.ajaxLoaded=0;g.dataLoaded={};g.ajaxRetry=0;g.ajaxAutoNext=0;g.elms='';g.lastLoaded=0;g.urlLoaded={};
    g.thumbSelector = 'a.uiMediaThumb[ajaxify], a.uiMediaThumb[rel="theater"],' +
      'a.uiMediaThumbMedium';
    g.statusEle = qS('[role="navigation"] :nth-of-type(2) a') ||
      qS('[data-click="home_icon"] a') || 
      qS('[href="https://www.facebook.com/?ref=tn_tnmn"]');
    g.statusText=g.statusEle.innerHTML;g.downloaded={};g.profilesList={};g.commentsList={count:0};
    g.photodata = {
      aName:aName.replace(/'|"/g,'\"'),
      aAuth:aAuth.replace(/'|"/g,'\"'),
      aLink:window.location.href,
      aTime:aTime,
      photos: [],
      aDes:aDes
    };
    g.newL = !!(qSA('#pagelet_timeline_medley_photos a[role="tab"]').length);
    if(location.href.match('messages')){
      getFbMessagesPhotos();
    }else{
      getPhotos();
    }
  }else if(location.href.match(/.*instagram.com/)){
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
      var html = this.response;
      var doc = getDOM(html);
      try{
        s=doc.querySelectorAll("script");
        for(i=0;i<s.length;i++){
          if(!s[i].src&&s[i].textContent.indexOf('_sharedData')>0){s=s[i].textContent;break;}
        }
        g.Env=JSON.parse(s.match(/({".*})/)[1]);g.stored=[];
        g.token = g.Env.config.csrf_token;
        var data = g.Env.entry_data;
        if (data.UserProfile || data.ProfilePage) {
          g.Env = (data.UserProfile || data.ProfilePage)[0];
        } else {
          alert('Need to reload for required variable.');
          location.reload(); return;
        }
      }catch(e){alert('Cannot load required variable!');}
      var userName = qS(".-cx-PRIVATE-ProfilePage__username, h1 span a, h1 span");
      userName = userName?userName.textContent:"";
      if(userName && userName!=g.Env.user.username){
        alert('Need to reload for required variable.');
        location.reload(); return;
      }
      if(g.mode != 2){
        g.total = qS('header li span span[class]') ?
         +getText('header li span span[class]').replace(/,/g,'') : g.Env.user.media.count;
      }else{
        g.total = g.Env.user.media.count;
      }
      console.log(g.Env);
      aName = g.Env.user.full_name;
      if(!aName)aName='Instagram';
      aAuth = g.Env.user.username;
      aLink = g.Env.user.website || g.Env.user.external_url;
      if(!aLink)aLink='http://instagram.com/'+aAuth;
      g.status = {e: qS('div[data-reactid*="$searchBox"]~a~a, ' +
        'a[data-reactid*="$profileLink"]')};
      var coreAct = qS('.coreSpriteActivity');
      if (!g.status.e) {
        if (coreAct) {
          var div = document.createElement('div');
          div.innerHTML = '<span id="dfaStatus"></span>';
          var parent = coreAct.parentNode.parentNode;
          parent.appendChild(div);
          parent.insertBefore(div, parent.childNodes[0]);
          g.status.e = qS('#dfaStatus');
        } else {
          g.status.e = qS('h1');
        }
      }
      g.status.t = g.status.e.textContent;
      g.Env.media = g.Env.user.media.nodes;
      g.loadCm = true;
      var aTime = g.Env.media ? g.Env.media[0].date || g.Env.media[0].created_time : 0;
      g.photodata = {
        aName: aName.replace(/'|"/g,'\"'),
        aAuth: aAuth,
        aLink: aLink,
        aTime: aTime ? 'Last Update: ' + parseTime(aTime) : '',
        photos: [],
        videos: [],
        aDes: (g.Env.user.bio || g.Env.user.biography || '').replace(/'|"/g,'\"')
      };
      getInstagram();
    };
    xhr.open('GET', location.href);
    xhr.send();
  }else if(location.href.match(/twitter.com/)){
    g.id = qS('.ProfileAvatar img').getAttribute('src').match(/\d+/);
    g.ajax = '';
    var name = qS('h1 a');
    var aTime = qS('.tweet-timestamp');
    var total = getText('.PhotoRail-headingWithCount').replace(',', '').match(/\d+/);
    g.total = total ? ('/' + total[0]) : '';
    g.status = 
    g.photodata = {
      aName: name.getAttribute('href').slice(1),
      aAuth: name.textContent,
      aLink: location.href,
      aTime: aTime ? aTime.getAttribute('data-original-title') : "",
      photos: [],
      aDes: getText('.ProfileHeaderCard-bio', true)
    };
    getTwitter();
  }else if(location.href.match(/weibo.com/)){
    try{
      aName='微博配圖';
      aAuth=getText('.username') || qS('.pf_photo img') ? qS('.pf_photo img').alt : '';
    }catch(e){}
    g.downloaded = {};
    var k = qSA('script'), id = '';
    for(i=0; i<k.length && !id.length; i++){
      t = k[i].textContent.match(/\$CONFIG\['oid'\]/);
      if(t)id = k[i].textContent;
    }
    eval(id);
    if(!$CONFIG){alert("發生錯誤，請聯絡作者");return;}
    g.oId = $CONFIG.page_id || $CONFIG.oid;
    var uId = qS('[action-type="copy_cover"]') || qS('[action-type="webim.conversation"]');
    if(uId){
      uId = uId.getAttribute('action-data').match(/uid=(\d+)/);
      if(uId){
        g.uId = uId[1];
      }
    }
    g.ajaxPage = 1;
    g.ajax = '';
    g.photodata = {
      aName:aName,
      aAuth:aAuth,
      aLink:location.href,
      aTime:aTime,
      photos: [],
      aDes:""
    };
    getWeibo();
  }else if(location.href.match(/pinterest.com/)){
    g.photodata = {
      aName: getText('h1.boardName') || 'Pinterest',
      aAuth: getText('h4.fullname') || '',
      aLink: location.href,
      aTime: aTime,
      photos: [],
      aDes: aDes
    };
    getPinterest();
  }else if(location.href.match(/flickr.com/)){
    try{
      aName=qS('h1.set-title').textContent.match(/\s*(.*)\s*/)[1];
      aAuth=qS('#setCrumbs a').textContent;
      aTime=qSA('.vsNumbers')[1].textContent;
    }catch(e){}
    g.linkPrefix=location.href.match(/(.*)sets/)[1];
    g.photodata = {
      aName:aName,
      aAuth:aAuth,
      aLink:location.href,
      aTime:aTime,
      photos: [],
      aDes:""
    };
    getFlickr();
  }else if(location.href.match(/ask.fm/)){
    g.count = 0;
    g.page = 0;
    var status = document.createElement('div');
    status.id = 'dfaContainer';
    status.className = 'side-section';
    status.innerHTML = '<h3><span id="dfaStatus"></span>  ' +
      '<label id="stopAjax">Stop <input id="stopAjaxCkb" style="' +
      '-webkit-appearance: checkbox;display: inline;width: auto;"' +
      ' type="checkbox"></label></h3>';
    qS('.sticky-anchor').appendChild(status);
    g.status = qS('#dfaStatus');
    g.total = +getText('.profileTabAnswerCount');
    g.title = document.title;
    g.username = getText('#profileName span:nth-of-type(2)').slice(1)
    g.photodata = {
      aName: getText('#profileName span:nth-of-type(1)'),
      aAuth: g.username,
      aLink: location.href,
      aTime: aTime,
      photos: [],
      videos: [],
      aDes: getText('#sidebarBio', 1)
    };
    getAskFM();
  }
  //}
})();
