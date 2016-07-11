/* Modified version
 * File API: Directories and System. Read/Write access to the filesystem
 * http://www.thecssninja.com/javascript/filesystem
 * Copyright (c) 2010 Ryan Seddon 
 * Dual-licensed under the BSD and MIT licenses.
 * http://thecssninja.com/demo/license.txt
 */

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-38726447-3', 'auto');
ga('set', 'checkProtocolTask', function(){});
ga('require', 'displayfeatures');
ga('send', 'pageview', location.pathname);

$('button').add('.dropdown-menu a').each(function(i,e){
  $(e).click(function(){
    var name = (this.name&&this.name.length)?this.name:this.textContent;
    ga('send', 'event', 'button', 'click', 'main: ' + name);
  });
});

var Core, FSA, worker, dropContainer;
var btn = [];
var img = /image.*/;
var URL = window.URL || window.webkitURL;
var blob = window.BlobBuilder || window.WebKitBlobBuilder;
var requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

String.prototype.getCodePointLength = function() {
  // http://stackoverflow.com/a/3759300
  return this.length - this.split(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g).length + 1;
};

FSA = {
  init: function () {
    if(requestFileSystem){
      worker = new Worker('js/task.js');
      worker.addEventListener('message', FSA.onMsg, false);
      worker.addEventListener('error', FSA.onError, false);
      document.getElementById("cName").textContent = "1.Change Name";
      dropContainer = document.getElementById("output");
      dropContainer.addEventListener("dragenter", function(e){
        e.stopPropagation();
        e.preventDefault();
      });
      dropContainer.addEventListener("dragover", function(e){
        e.stopPropagation();
        e.preventDefault();
      });
      dropContainer.addEventListener("drop", FSA.handleDrop);

      // Grab any images from filesystem and display in drop container
      FSA.getFiles();
      $('#output').delegate('.fsImg', 'dblclick', function(e){
        var src = e.target.src;
        var name = src.slice(src.lastIndexOf('/')+1);
        FSA.removeFile(name);
      });
      FSA.namePreview();
    } else {
      alert("Unfortunately your browser doesn't yet support the File API,\nPlease try latest Google Chrome.");
    }
  },
  getFiles: function() {
    worker.postMessage({type: 'getFiles'});
  },
  removeFile: function(name){
    $(".fsImg[src*='" + name + "']").remove();
    $("#fsCount").text(function(i,e){
      return e-1;
    });
    worker.postMessage({type: 'removeFile', name: name});
  },
  padZero: function(str, len) {
    str = str.toString();
    while (str.length < len) {
      str = '0' + str;
    }
    return str;
  },
  getName: function(e, format){
    format = format ? $('#nameFormat').val() : false;
    var oName = e.src.slice(e.src.lastIndexOf('/')+1);
    var query = oName.match(/(.*)\?.*/);
    if(query)oName = query[1];
    if (format) {
      var item = $(e).parents('.item');
      var index = item.find('.badge')[0].textContent;
      var padIndex = FSA.padZero(index, FSA.maxIndexLength); 
      var ext = oName.match(/\.\w{3,4}$/);
      if (ext) {
        ext = ext[0];
      } else {
        ext = oName.match(/(\.\w{3,4})\?*/);
        ext = ext ? ext[1] : null;
      }
      var date = item.find('.date').text().replace(/:/g, '');
      date = (date == 'undefined') ? '' : date;
      var caption = '', captionFL = '', captionFW = '';
      if (format.match(/\$c|\$fc|\$fw/)) {
        var captionMax = $('#captionMax').val();
        caption = item.find('.caption').text()
          .replace(/\n|\r/g, '').slice(0, captionMax);
        captionFL = caption.slice(0, caption.indexOf("\n"));
        captionFW = caption.slice(0, caption.indexOf(" "));
        format = format.replace('$c', caption)
          .replace('$fc', captionFL).replace('$fw', captionFW);
      }
      var tag = '', firstTag = '';
      if (format.match(/\$t|\$ft/)) {
        item.find('.loadedTag .tagName').each(function(i, e){
          if(!firstTag.length)firstTag = $(e).text();
          if(!tag.length)tag = $(e).text();
          else{tag += '_' + $(e).text();}
        });
        format = format.replace('$t', tag).replace('$ft', firstTag);
      }
      oName = format.replace('$i', index).replace('$pi', padIndex)
        .replace('$o', oName).replace('$d', date)
        .replace('$an', $('#albumName').val())
        .replace(/[\u0000\/\\:\*\?"<>\|#@!\$',;=]/g, ' ')
        .replace(/  /g, " ").replace(/\s$/,'');
      try {
        var encoded = encodeURIComponent(oName)
      } catch(e) {
        // Fix URI malformed
        encoded = '';
        var codePoint, ucChar, temp;
        var len = oName.getCodePointLength();
        for (var i = 0; i < len; i++) {
          try {
            codePoint = oName.codePointAt(i);
            ucChar = String.fromCodePoint(codePoint);
            temp = encodeURIComponent(ucChar);
            encoded += ucChar;
          } catch (e) {}
        }
        oName = encoded;
        console.log(encoded);
      }
      if(ext){
        if(oName.indexOf(ext)<0)oName += ext;
        oName = oName.replace("."+ext, ext);
      }
    }
    return oName;
  },
  namePreview: function(){
    FSA.maxIndexLength = (FSA.data.photos.length + '').length;
    $("#namePreview").text(FSA.getName($(".fancybox img").get(0), true));
    /*var text = '';
    $(".fancybox img").each(function(i, e){
      text += FSA.getName(e, true)+"\n";
    })
    $("#namePreview").text(text);*/
  },
  changeName: function(){
    var list = [];
    $('.fancybox img').each(function(i,e){
      list.push({old: FSA.getName(e), new: FSA.getName(e, true)});
    });
    worker.postMessage({type: 'changeName', data: list});
  },
  changeImgUrl: function(){
    $('.fancybox img').each(function(i,e){
      var nName = FSA.getName(e, true);
      e.src = './' + nName;
      $(e).parentsUntil('.item')[2].href = './' + nName;
      var t = e.parentNode.outerHTML;
      e.parentNode.outerHTML = t.replace(/url.*[)]/g, "url('./" + nName + "')");
    });
  },
  autoZipAll: function(){
    var list = [], src = [], cN = confirm('Change file name?');
    $('.fancybox img').each(function(i, e){
      var index = $(e).parents(".item").find(".badge")[0].textContent;
      var tName = cN ? FSA.getName(e, true) : FSA.getName(e);
      list[index] = tName;
      src[index] = e.src;
      e.src = './' + tName;
      $(e).parentsUntil('.item')[2].href = './' + tName;
      var t = e.parentNode.outerHTML;
      e.parentNode.outerHTML = t.replace(/url.*[)]/, "url('"+tName+"')");
    });
    FSA.getHTML(1);
    worker.postMessage({type: 'autoZip', data: list, src: src, html: FSA.html, cN: cN});
  },
  getHTML: function(mode){
    $('#cName').add('#urlFix').add('.cName').add('[data-remove="true"]').add('.pR').remove();
    $('script')[0].src = 'https://dl.dropbox.com/u/4013937/jquery.min.js';
    $('link:eq(0)').prop('href', 'https://dl.dropboxusercontent.com/u/4013937/bootstrap.min.css');
    $('script:gt(0)').remove();
    var data = '<html><head><meta charset="utf-8" />' + document.head.innerHTML + '</head>' + document.body.outerHTML + '</html>';
    var blobData = new Blob([data], {type: 'text/html;charset=utf-8'});
    if(!mode){
      saveAs(blobData, document.title + '.html');
    }else{
      FSA.html = new Blob([data], {type: 'text/html;charset=utf-8'});
    }
  },
  saveRawData: function(){
    var blobData = new Blob([JSON.stringify(FSA.data)], {type: 'text/plain;charset=utf-8'});
    saveAs(blobData, document.title + '.txt');
  },
  savePhotoUrl: function(){
    var photos = [];
    FSA.data.photos.forEach(function(item) {
      photos.push(item.url);
    });
    photos = photos.join('\n');
    var blobData = new Blob([photos], {type: 'text/plain;charset=utf-8'});
    saveAs(blobData, document.title + '.txt');
  },
  saveVideoUrl: function(){
    var videos = [];
    FSA.data.videos.forEach(function(item) {
      videos.push(item.url);
    });
    videos = videos.join('\n');
    var blobData = new Blob([videos], {type: 'text/plain;charset=utf-8'});
    saveAs(blobData, document.title + '-videos.txt');
  },
  zipAllFiles3: function(){
    FSA.getHTML(1);
    console.time('zip');
    worker.postMessage({type: 'zipAllFiles3', html: FSA.html});
  },
  handleDrop: function (e) {
    e.stopPropagation();
    e.preventDefault();
    worker.postMessage({type: 'handleDrop', data: e.dataTransfer.files});
  },
  progressLast: -1,
  progress: function(count,i){
    i++;
    if (+new Date() - FSA.progressLast < 1000) {
      return;
    }
    FSA.progressLast = +new Date();

    var $p = $('#progress');
    var $t = $('.progress-text');
    if((count-i) == 0 || i > count){
      FSA.progressLast = -1;
      $t.text(0);
      $p.hide();
      return;
    }
    if(count != i){
      $p.show();
      var percent = Math.round(i / count * 100);
      $t.text(percent + '%');
    }else{
      $p.hide()
    }
  },
  reset: function() {
    worker.postMessage({type: 'reset'});
  },
  onError: function(e){
    console.log('ERROR: Line ' + e.lineno + ' in ', e.filename + ': ' + e.message);
  },
  onMsg: function(e){
    var d = e.data;
    switch (d.type){
      case 'progress':
        FSA.progress(d.data[0], d.data[1]);
        break;
      case 'appendFragment':
        $('.fsImg').remove();
        FSA.imgPreview = '';
        FSA.imgPreviewFull = '';
        $('#fsCount').text(d.data.length);
        $('#fsPreview').click(function(){
          if($('.fsImg').length){
            $('.fsImg').remove();
          }else{
            $(dropContainer).append(FSA.imgPreview);
          }
        });
        $('#fsPreviewFull').click(function(){
          if($('.fsImg').length){
            $('.fsImg').remove();
          }else{
            var t = FSA.imgPreview + FSA.imgPreviewFull;
            //console.log(t);
            $(dropContainer).append(t);
          }
        });
        for(var i=0, k; k = d.data[i]; ++i){
          var t = '<img class="fsImg" width="192" src=' + k + ' />';
          if(i < 30){
            FSA.imgPreview += t;
          }else{
            FSA.imgPreviewFull += t;
          }
        }
        break;
      case 'saveAs':
        saveAs(d.data, 'photos.zip');
        console.timeEnd('zip');
        break;
      case 'pendRemove':
        for(i = 0; i < d.data.length; i++){
          $(".item:has('img[src*=\""+d.data[i]+"\"]')").remove();
          $('.col-lg-3:empty').remove();
        }
        cleanup();
        FSA.changeImgUrl();
        alert('done.');
        break;
      default:
        console.log(e.data);
    }
  }
};

Core = {
  hrefs: [],
  changeName: function(){
    if(!worker){
      FSA.init();
      if(requestFileSystem){
        $('.cName').show();
        $('.msg').remove();
        var msg = "Steps to change name:\n1. Save the page with images\n2. Click 'ChangeName'\n->'Ok' to reverse photo's order\n3. 'Auto Zip all' -> Wait & Done!\n      OR\n   Drag the images you needed\n4. Click 'Change Name'\n5. 'Zip all files' -> Unzip & Done!\n(6. If you want to view generated page offline,\nsave the HTML in zip again to embed the script )";
        if(!localStorage['downFbAlbumhelp']){
          localStorage['downFbAlbumhelp'] = 1;
          alert("'THIS MESSAGE ONLY SHOW ONCE,\nclick HELP to see it again'\n\n" + msg);
        }
        $('#help').click(function(){alert(msg);});
        $('#albumName').val($('#aName').text());
        $('#nameFormat, #albumName, #captionMax').on('change keyup', FSA.namePreview);
      }
    }else if(worker){
      if(confirm('Do you want to change files name?')){FSA.changeName();}
    }
  },
  reverseIndex: function() {
    var reversed = false;
    var len = $('.item').length;
    $('.badge').each(function(i, e) {
      if (i == 0  && $(e).text() == (len-i)) {
        reversed = true;
      }
      $(e).text(reversed ? (i + 1) : (len - i));
    });
  },
  sortByDate: function(){
    var arr = [];
    $('.item').each(function(i, e){
      var date = $(e).find('.date').text();
      date = (date && date != 'undefined') ? (+new Date(date) || i) : i;
      arr.push({e: e, date: date});
    });
    arr.sort(function(a, b){
      return a.date - b.date;
    });
    for(var i = 0; i < arr.length; i++){
      $(arr[i].e).find('.badge').text(i + 1);
    }
    Core.rearrangeItem();
  },
  loadData: function (c) {
    FSA.data = c;
    c.newLayout = location.pathname == '/photos.html';
    var b = c.newLayout && !Core.albumMerge ? "<div class='row'>" : "";
    if (!c) {
      alert('Ooops!! I didnt catch any photo, please try it again or refresh the album page.');
      return
    }
    c.aName = c.aName ? c.aName : 'Facebook';
    $('#aName').html( "<a href='" + c.aLink + "' target='_blank'>" + c.aName + "</a> " + (c.aAuth?'- '+c.aAuth:"") );
    document.title= c.aName ? (c.aAuth?c.aAuth+"-":"")+c.aName : "DownAlbum";
    $('#aDes').html(c.aDes);
    $('#aTime').html(c.aTime);
    if(c.dTime)$('#dTime').html('Download at: ' + c.dTime);
    var d = c.photos;
    if(!d.length)return;
    if(!c.largeAlbum && d.length>1000)c.largeAlbum = confirm('You have loaded more than 1000 photos,\nUse Large Album Optimize?');
    for (var i = 0; i < d.length; i++) {
      if (Core.albumMerge && Core.hrefs.indexOf(d[i].href) != -1) {
        continue;
      }
      var href = d[i].href ? ' href="'+d[i].href+'" target="_blank"' : '';
      var title = d[i].title || '';
      var tag = d[i].tag || '';
      var comments = d[i].comments || '';
      var tagIndi = '', dateInd = '',commentInd = '';
      if(tag){
        tag = tag.replace(/href="/g, 'target="_blank" href="https://www.facebook.com');
        tag='<div class="loadedTag">'+tag+'</div>';
        tagIndi='<i class="tagArrow tagInd"></i>';
      }
      if(comments){
        var co ='<div class="loadedComment">';
        try{
          if(comments[0]>comments.length-1){
            var cLink = comments[1].fbid ? ("https://www.facebook.com/photo.php?fbid="+comments[1].fbid) : comments[1].id;
            co += '<p align="center"><a href="'+cLink+'" target="_blank">View all '+comments[0]+' comments</a></p>';
          }
        }catch(e){}
        for(var ii=1; ii<comments.length; ii++){
          var p = comments[ii];
          co += '<blockquote><p>'+p.text+'</p><small><a href="'+p.url+'" target="_blank">'+p.name+'</a> '+(p.fbid?('<a href="https://www.facebook.com/photo.php?fbid='+p.fbid+'&comment_id='+p.id+'" target="_blank">'):'')+p.date+(p.fbid?'</a>':'')+'</small></blockquote>';
        }
        comments = co + '</div>';
        commentInd = '<a title="Click to view comments" rel="comments"><i class="tagArrow commentInd"></i></a>';
      }
      if(d[i].date){
        dateInd = c.newLayout ? '<div class="dateInd"><i class="tagArrow dateInd"></i></div>' : '<div class="dateInd"><span>' + d[i].date + '</span> <i class="tagArrow dateInd"></i></div>';
      }
      var $t = [];
      var test = false;
      var test2 = false;
      try{if(title.match(/<.*>/))$t = $(title);}catch(e){}
      try{test = title.match(/hasCaption/) && $t.length;}catch(e){}
      try{test2 = title.match(/div/) && title.match(/span/)}catch(e){}
      try{
        if(test){
          $t.find('.text_exposed_hide').remove();
          title = $t.html();
          if(title.indexOf("<br>") == 0)title = title.slice(4);
        }else if(test2){
          title = title.replace(/&(?!\w+([;\s]|$))/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
        else if($t.length){
          try{
            $t.find('.text_exposed_hide').remove().end()
            .find('div *').unwrap().end()
            .find('.text_exposed_show').unwrap().end()
            .find('span').each(function() {$(this).replaceWith(this.childNodes);});
            title=$t.html();
          }catch(e){}
        }
      }catch(e){}
      title = title ? '<div class="caption"><a class="captions" rel="captions"></a><p>' + title + '</p></div>' : '<div class="caption"></div>';
      var TEMPLATE = "";
      if(c.newLayout){
        var srcInd = '<a ' + href + '><i class="tagArrow srcInd"></i></a>';
        TEMPLATE = '<div class="col-4 col-lg-3"><div id="item' + i + '" class="thumbnail item' + (c.largeAlbum?' largeAlbum':'') + '" rel="gallery"><div class="tools">' + srcInd + dateInd + '<a class="selector"><span class="badge">' + (i+1) + '</span></a>' + commentInd + tagIndi + '</div><p class="date">' + d[i].date + '</p><a class="fancybox" rel="fancybox" href="' + d[i].url + '" target="_blank"><div class="crop"><div style="background-image: url(' + d[i].url + ');" class="img"><img src="' + d[i].url + '"></div></div></a>' + title + tag + comments + '</a></div></div>';
      }else{
        TEMPLATE = '<div rel="gallery" class="item' + (c.largeAlbum?' largeAlbum':'') + '" id="item' + i + '"><a class="badge"' + href + '>' + (i+1) + '</a>' + commentInd + tagIndi + dateInd + '<a class="fancybox" rel="fancybox" href="' + d[i].url + '" target="_blank"><div class="crop"><div style="background-image: url(' + d[i].url + ');" class="img"><img src="' + d[i].url + '"></div></div></a>' + title + tag + comments + '</div>'
      }
      b = b + "" + TEMPLATE;
    }
    if(c.newLayout && !Core.albumMerge)b = b + "<div>";
    if (Core.albumMerge) {
      $('#container .row').append(b);
    } else {
      $('#container').append(b);
    }
    $('#exportVideoUrl').text('Export Video Url (' +
      (c.videos ? c.videos.length : 0) + ')');
    //Core.lazyInit();
    // Remove listener to prevent interrupt by other tab
    onMsgAPI.removeListener(msgHandle);
  },
  getData: function(a){
    var u=a.url;
    $.get(u[0],{},function(d){
      $d=$(d).filter("code").each(function(i,e){$(e).html(e.innerHTML.replace("<!--","").replace("-->",""))});
      console.log($d)
    });
  },
  initEvent: function(){
    var eventList = ["resetFs", ".reset", "zipAllFiles", ".zipAllFiles3",
      "reloadFs", ".getFiles", "cName", "changeName", "cleanup", "cleanup",
      'autoZipAll', '.autoZipAll', 'filterBar', 'filterInit',
      'selectAll', 'filterSelect', 'removeAll', 'filterRemove',
      'sortByDate', 'sortByDate', 'exportMeta', '.saveRawData',
      'exportPhotoUrl', '.savePhotoUrl', 'exportVideoUrl', '.saveVideoUrl', 
      'reverseIndex', 'reverseIndex',
      'albumMerge', 'albumMergeInit', 'albumMergeSave', 'albumMergeSave'];
    while(eventList.length){
    var e=(eventList[1].indexOf(".")>-1)?FSA:Core;
    $("#"+eventList[0]).click(e[eventList[1].replace(".","")]);
    eventList.shift();eventList.shift();
    }
    $('script:gt(0)').remove();
    $('script').attr('src','https://dl.dropbox.com/u/4013937/jquery.min.js');
    $("link:eq(0)").prop("href", "https://dl.dropboxusercontent.com/u/4013937/bootstrap.min.css");
    $('#container').on('click', '.badge', function(e){
      $(e.target).toggleClass('label-info');
    }).on('click', function(e){
      $e = $(e.target);
      if($e[0].className.match(/item|col-4|tools/))$e.find('.badge').toggleClass('label-info');
    });
    // For lazy testing:
    /* 
    while($('.col-lg-3').length<1000)$('.col-lg-3').clone().appendTo('#container .row')
    Core.lazyInit();
    */
    if(location.pathname == "/album.html")Core.albumInit();
    if(location.search.length)Core.albumLoad();
  },
  albumInit: function(){
    chrome.runtime.getBackgroundPage(function(w){
      chrome.storage.local.get('album', function(item){
        if(!item.album)return;
        var set = item.album.set;
        var cache = "";
        var local = "";
        for(var i = 0; i < set.length; i++){
          var e = set[i];
          var page = !!w.localStorage.newLayout.length ? 'photos' : 'fbphotos';
          var date = new Date(e.date).toLocaleString();
          var href = e.local?e.url:(page +'.html?key='+ e.key);
          var len = e.len ? ('<span class="pull-right">Total: ' + e.len + '&nbsp;&nbsp;</span>') : '';
          if (e.key != i+1 && !e.local) {
            sendMsgAPI({type: 'remapAlbum'});
            setTimeout(Core.albumInit, 500);
            return;
          }
          if(!e.key)e.key = i+1;
          var s = '<div class="col-4 col-lg-3"><div id="item' + e.key + '" class="thumbnail item" rel="gallery"><div class="tools"><button type="button" class="albumRemove btn btn-default btn-mini pull-right">X</button><div class="dateInd"><i class="tagArrow dateInd"></i></div><a class="selector"><span class="badge">' + (+i+1) + '</span></a>' + len + '</div><p class="date">' + date + '</p><a href="'+href+'" target="_blank"><div class="crop"><div style="background-image: url(\'' + e.cover + '\');" class="img"><img src="' + e.cover + '"></div></div></a><div class="caption"><a class="captions" rel="captions"></a><p>' + e.name + '</p></div></a></div></div>';
          if(e.local)local += s;
          else{cache += s;}
        }
        $("#cachedAlbum, #localAlbumSet").empty();
        if(cache.length)$("#cachedAlbum").append(cache);
        if(local.length)$("#localAlbumSet").append(local);
        $('#addAlbum').click(Core.albumAdd);
        $('#removeAll').off('click').click(Core.albumRemove);
        $('#container').on('click', '.albumRemove', Core.albumRemove);
        $('#resetAlbum').click(Core.albumReset);
        onMsgAPI.removeListener(msgHandle);
      });
    });
  },
  albumLoad: function(){
    var key = location.search.match(/key=(.*)/);
    if(key){
      try{sendMsgAPI({type:'export',key: key[1]});}catch(e){alert(deprecatedMsg);}
      /*
      key = 'item' + key[1];
      chrome.storage.local.get(key, function(item){
        Core.loadData(item[key]);
      })*/
    }
  },
  albumMerge: false,
  albumMergeInit: function() {
    var key = window.prompt('Please enter album id. ( photos.html?key={id} )');
    if (key) {
      Core.albumMerge = true;
      onMsgAPI.addListener(msgHandle);
      sendMsgAPI({type:'export', key: key});
    }
  },
  albumMergeCb: function(d) {
    if (!d.photos) {
      return;
    }
    var count = 0;
    var hrefs = Core.hrefs;
    FSA.data.photos.forEach(function(e) {
      if (hrefs.indexOf(e.href) == -1) {
        hrefs.push(e.href);
      }
    });
    d.photos.forEach(function(e) {
      if (hrefs.indexOf(e.href) == -1) {
        FSA.data.photos.push(e);
        count++;
      }
    });
    Core.loadData(FSA.data);
    console.log('Merged ' + count + ' photos.');
  },
  albumMergeSave: function() {
    sendMsgAPI({type:'export', data: FSA.data, saveOnly: true});
  },
  albumAdd: function(){
    $('.cName').show();
    $('.nav-tabs li:eq(1) a').tab('show');
    $("#albumPathDone").click(function(){$('#output').show()});
    $('#fsReset').click(function(){
      Core.albumPending = 0;
      Core.albumPendingHTML = [];
      Core.albumDuplicateCheck = {};
      $('#fsCount').text("0");
    });
    var drop = document.getElementById("output");
    drop.addEventListener("dragenter", function(e){e.stopPropagation();e.preventDefault();});
    drop.addEventListener("dragover", function(e){e.stopPropagation();e.preventDefault();});
    drop.addEventListener("drop", function(e){
      e.stopPropagation();e.preventDefault();
      Core.albumDrop(e);
    });
    //FSA.getFiles();
  },
  albumPending: 0,
  albumPendingHTML: [],
  albumPendingFolder: [],
  albumDuplicateCheck: {},
  albumProcessIndex: 0,
  albumProcessed: false,
  albumDrop: function(e){
    var len = e.dataTransfer.items.length;
    for (var i = 0; i < len; i++) {
      var entry = e.dataTransfer.items[i].webkitGetAsEntry();
      if(!Core.albumDuplicateCheck[entry.fullPath]){
        Core.albumDuplicateCheck[entry.fullPath] = true;
        Core.albumChecking(entry);
        FSA.progress(len, i);
        $('#fsCount').text(Core.albumPending);
      }
    }
  },
  albumChecking: function(entry){
    clearTimeout(Core.albumTimer);
    if (entry.isFile) {
      if(entry.name.match(/\.htm|\.html/)){
        Core.albumPending++;
        Core.albumPendingHTML.push(entry);
      }
    }else if(entry.isDirectory) {
      var reader = entry.createReader();
      reader.readEntries(function(files){
        for(var i = 0; i<files.length; i++){
          var file = files[i];
          if(file.isFile && file.name.match(/\.htm|\.html/)){
            Core.albumPending++;
            Core.albumPendingHTML.push(files[i]);
            $('#fsCount').text(Core.albumPending);
            // TODO: if directory contains only photos but without corresponding html,
            // create a un-named album for it
          }else if(file.isDirectory){
            Core.albumChecking(file);
          }
          FSA.progress(files.length, i);
        }
      })
    }
    Core.albumProcessIndex = 0;
    Core.albumProcess_subQueue = [];
    Core.albumTimer = setTimeout(Core.albumProcess, 500);
  },
  albumProcess: function(){
    Core.albumProcess_subTimer = setTimeout(Core.albumProcess_sub, 3000, window);
    //console.log(Core.albumProcessIndex,Core.albumPendingHTML);
    Core.albumProcessed = false;
    var path = "file:///" + $("#albumPath").val().replace(/ /g, "%20").replace(/\\/g, "/");
    var entry = Core.albumPendingHTML[Core.albumProcessIndex];
    if(entry)entry.file(function(file){
      clearTimeout(Core.albumProcess_subTimer);
      var reader = new FileReader();
      reader.onloadstart = function(){
        Core.albumProcessed = false;
        clearTimeout(Core.albumTimer);
      };
      reader.onload = function(e){
        clearTimeout(Core.albumTimer);
        var html = e.target.result;
        if(html.indexOf('https://dl.dropbox.com/u/4013937/jquery.min.js')>0){
          html = $(html);
          //FSA.temp = html;
          //console.log(FSA.temp);
          var name = html.find('h3#aName');
          if(!name || !name.length){
            name = html.find('h1');
            name.find('button').remove();
          }
          name = name.text();
          var cover = html.find('.item:eq(0) a.fancybox').attr('href');
          var url = path+entry.fullPath;
          cover = url.slice(0, url.lastIndexOf("/")) + cover.replace("./", "/");
          var item = {
            name: name,
            cover: cover,
            local: true,
            url: url,
            date: +new Date()
          };
          //console.log(item);
          Core.albumProcessQueue.push(item);
        }
        Core.albumProcessed = true;
        FSA.progress(Core.albumPendingHTML.length, Core.albumProcessIndex);
        if(Core.albumProcessed && Core.albumProcessIndex<Core.albumPendingHTML.length){
          Core.albumTimer = setTimeout(function(){
            Core.albumProcessIndex++;
            Core.albumProcess();
          }, 1000);
        }
      };
      reader.readAsText(file);
    });
  },
  albumProcessQueue: [],
  albumProcess_sub: function(){
    try{sendMsgAPI({type:'addAlbum',data:Core.albumProcessQueue});
    }catch(e){alert(deprecatedMsg);}
  },
  albumRemove: function(e){
    var $t = $('.row .item:has(.badge.label-info)');
    if(!$t.length && $(e.target).is('.albumRemove'))$t = $(e.target).parents('.item');
    if(!$t.length || !confirm('Remove selected album?'))return;
    var removed = [];
    $t.each(function(i, e){
      console.log(e.id);
      removed.push(e.id.slice(4));
      chrome.storage.local.remove(e.id);
      $t.parent().remove();
    });
    chrome.storage.local.get('album', function(item){
      var set = item.album.set;
      for(var i = 0; i<set.length && removed.length; i++){
        var checked = false;
        for(var j = 0; j<removed.length && !checked; j++){
          if(set[i].key==removed[j] || set[i].local&&(i+1)==removed[j]){
            set.splice(i, 1);
            removed.shift();
            checked = true;
          }
        }
      }
      chrome.storage.local.set({album: item.album});
      chrome.runtime.getBackgroundPage(function(w){
        w.Store.album = null;
        w.Store.map();
      });
    })
  },
  albumReset: function(){
    if(!confirm('Remove all albums?'))return;
    chrome.storage.local.get(null, function(obj){
      var keys = Object.keys(obj);
      for(var i = 0; i<keys.length; i++){
        chrome.storage.local.remove(keys[i]);
      }
      chrome.runtime.getBackgroundPage(function(w){
        w.Store.map();
      });
      location.reload();
    });
  },
  filter: {},
  filterTimer: 0,
  filterInited: false,
  filterInit: function(){
    if(!Core.filterInited){
      Core.filterInited = true;
      $('.filterBar').show().on('click keyup', Core.handleFilter);
      $('#addFilter').click(Core.addFilter);
      $('#resetFilter').click(Core.resetFilter);
    }else{
      $('.filterBar').toggle();
    }
  },
  addFilter: function(){
    $('.filter:last').after($('.filter:first').clone());
    $('.filter:last input').val('');
  },
  resetFilter: function(){
    $('.filter:gt(0)').remove();
    $('#container').find('.row>div').add('.tab-content div').removeClass('hide');
  },
  handleFilter: function(){
    if(Core.filterTimer){
      clearTimeout(Core.filterTimer);
      Core.filterTimer = 0;
    }
    Core.filterTimer = setTimeout(Core.applyFilter, 500);
  },
  applyFilter: function(){
    var switches = {}, filter = {};
    $('.switch .col-4').each(function(i, e){
      var type = $(e).find('input[type="checkbox"]').prop("checked");
      if(type){
        var s = $(e).find('input:checked[type="radio"]');
        //console.log(s.attr('name')+' '+type+' '+s.val());
        switches[s.attr('name')] = s.val()=='with';
      }
    });
    $('.filter').each(function(i, e){
      var s = $(e).find('input').val();
      if(s&&s.length){
        var type = $(e).find('select').val();
        //console.log(i+' '+type+' '+s);
        if(!filter[type])filter[type] = s;
        else{filter[type] += "|" + s;}
      }
    });
    if(JSON.stringify(filter).length>2)switches.filter = filter;
    if(JSON.stringify(Core.filter)===JSON.stringify(switches) || JSON.stringify(switches).length==2)return;
    Core.filter = switches;
    //console.log(Core.filter);
    $('.item').each(function(i, e){
      var need = true;
      if(switches.caption!==undefined || filter["Caption"]){
        var caption = $(e).find('.caption').text();
        need = Core.filterSub(switches.caption, caption, filter["Caption"]);
      }
      if(switches.comment!==undefined || filter["Comment"]){
        var comment = $(e).find('.loadedComment').text();
        need = Core.filterSub(switches.comment, comment, filter["Comment"]);
      }
      if(switches.tag!==undefined || filter["Tag"]){
        var tag = '';
        $(e).find('.loadedTag .tagName').each(function(i, e){
          if(!tag.length)tag = $(e).text();
          else{tag += "|" + $(e).text();}
        });
        need = Core.filterSub(switches.tag, tag, filter["Tag"]);
      }
      $(e).parent().toggleClass('hide', !need);
    });
  },
  filterSub: function(switches, test, filter){
    var need = true;
    if(switches!==undefined){
      var s = test ? !!test.length : false;
      need = (switches == s);
    }
    try{
      if(filter)need = !!test.match(new RegExp(filter, "i"));
    }catch(e){}
    return need;
  },
  filterSelect: function(){
    $('#container').find('>.row>.col-4:not([class*="hide"]) .badge').add('.tab-pane.active .col-4:not([class*="hide"]) .badge').toggleClass('label-info');
  },
  filterRemove: function(){
    $('#container').find('>.row>.col-4:has(.badge.label-info)').remove();
  },
  rearrangeItem: function (){
    var container = $('#container .row')[0];
    var items = $('#container .col-4');
    var total = items.length;
    var i, e, pos;
    var map = [];
    for(i = 0; i < total; i++) {
      e = items[i];
      pos = e.querySelector('.badge').textContent - 1;
      map[pos] = e;
    }
    for(i = 0; i < total; i++) {
      container.insertBefore(map[i], container.childNodes[i]);
    }
  },
  lazyEvent: false,
  lazyTimer: 0,
  lazyDelay: 500,
  lazySource: [],
  lazyTarget: [],
  lazyInit: function(){
    if(!Core.lazyEvent){
      Core.lazyEvent = true;
      document.addEventListener('scroll',function(){
        if(Core.lazyTimer){
          clearTimeout(Core.lazyTimer);
          Core.lazyTimer = 0;
        }
        Core.lazyTimer = setTimeout(Core.lazyShow, Core.lazyDelay);
      });
    }
    this.lazySource = [];
    this.lazyTarget = [];
    $('.col-lg-3').each(function(i, e){
      Core.lazySource.push(e);
      e.dataset['offsetTop'] = e.offsetTop;
      Core.lazyTarget.push($(e).find('.crop')[0]);
    });
    Core.lazyShow();
  },
  lazyShow: function(){
    var top = document.body.scrollTop;
    for(var i = 0; i < Core.lazySource.length; i++){
      var e = Core.lazySource[i];
      Core.lazyTarget[i].style.visibility = Math.abs(top - e.dataset['offsetTop'])>400 ? 'hidden' : 'visible';
    }
  }
};

if(chrome.extension){
  window.msgHandle = function (a) {
    console.log(a);
    if(a.type=='addAlbum'){
      Core.albumInit();
    }else if(a.type=='multi'){
      Core.getData(a);
    }else if(Core.albumMerge){
      Core.albumMergeCb(a);
    }else if(a.photos){
      Core.loadData(a);
    }
  };
  window.onMsgAPI = chrome.runtime.onMessage || chrome.extension.onRequest;
  window.sendMsgAPI = chrome.runtime.sendMessage || chrome.extension.sendRequest;
  window.deprecatedMsg = "Your Chrome version is too low, please update to latest version!";
  try{onMsgAPI.addListener(msgHandle);}catch(e){alert(deprecatedMsg);}
}

$(function(){
  Core.initEvent();
  $(".msg").fadeOut().fadeIn().delay(2000).fadeOut();
});
