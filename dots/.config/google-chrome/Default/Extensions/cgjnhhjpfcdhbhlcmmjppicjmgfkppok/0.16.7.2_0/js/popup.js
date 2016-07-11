(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-38726447-3', 'auto');
ga('set', 'checkProtocolTask', function(){});
ga('require', 'displayfeatures');
ga('send', 'pageview', '/popup.html');

var k = document.querySelectorAll('button'), loadCm = 0, largeAlbum;
var sendMsgAPI = chrome.runtime.sendMessage || chrome.extension.sendRequest;
for(var i = 0; i<k.length; i++){
  k[i].addEventListener('click', function(){
    if(this.id && this.id.length == 1){
      switch(this.id){
        case '5':
          sendMsgAPI({type: 'last'});
          break;
        case '6':
          chrome.tabs.getSelected(null, function(currentTab){
            chrome.tabs.create({ url:chrome.extension.getURL('album.html'), index:currentTab.index+1, active:true });
          });
          break;
        case '7':
          exePhotosOfScript();
          break;
        default:
          exeScript(this.id);
      }
    }
    var name = (this.name&&this.name.length)?this.name:this.textContent;
    ga('send', 'event', 'button', 'click', 'popup: ' + name);
  });
}

var compress, newLayout, rightClick;
chrome.runtime.getBackgroundPage(function(w){
  var js = document.createElement('script'); js.id = 'facebook-jssdk';
  js.src = "https://connect.facebook.net/en_US/all.js#xfbml=1";
  document.body.appendChild(js);

  document.querySelector('#donate').addEventListener('click', function(){
    chrome.tabs.create({url: 'http://goo.gl/T9gVE'});
    ga('send', 'event', 'button', 'click', 'popup: Donate');
    window.close();
  });

  if(!w.localStorage['loadCm'])w.localStorage['loadCm'] = '';
  var loadCmSetting = w.localStorage['loadCm'].length>1;
  var t = document.querySelector('#loadCm');
  t.checked = loadCmSetting;loadCm=loadCmSetting;
  t.addEventListener('click', function(){loadCm=!loadCm;w.localStorage['loadCm']=loadCm?'true':'';});

  if(!w.localStorage['largeAlbum'])w.localStorage['largeAlbum'] = '';
  var largeAlbumSetting = w.localStorage['largeAlbum'].length>1;
  var t2 = document.querySelector('#largeAlbum');
  t2.checked = largeAlbumSetting;largeAlbum=largeAlbumSetting;
  t2.addEventListener('click', function(){largeAlbum=!largeAlbum;w.localStorage['largeAlbum']=largeAlbum?'true':'';});

  if(w.localStorage['newLayout']==undefined)w.localStorage['newLayout'] = true;
  var newLayoutSetting =  w.localStorage['newLayout'].length>1;
  var t5 = document.querySelector('#newLayout');
  t5.checked = newLayoutSetting;
  newLayout = newLayoutSetting;
  t5.addEventListener('click',function(){
    newLayout = !newLayout;
    w.localStorage['newLayout'] = newLayout?'true':'';
    ga('send', 'event', 'button', 'click', 'newLayout: '+(newLayout?'on':'off'));
  });
});

function exeScript(mode){
  chrome.tabs.query({active: true}, function(tab){
    chrome.tabs.executeScript(tab.id, {
      code: "var d=document.querySelector('#fbDown'); if(!d){d=document.createElement('div'); d.id='fbDown';d.style.display='none'; document.body.appendChild(d); }d.textContent='" + mode + ','+ (loadCm?'true':'') + ',' + (largeAlbum?'true':'') + ',' + (newLayout?'true':'') + "';"
      });
    chrome.tabs.executeScript(tab.id, {file: "./js/fetcher.js"});
    window.close();
  })
}
function exePhotosOfScript(){
  chrome.tabs.query({active: true}, function(tab){
    chrome.tabs.executeScript(tab.id, {file: "./js/photosOfHelper.js"});
    window.close();
  })
}

setTimeout(function(){
  document.querySelector('#extFrame').innerHTML = '<iframe scrolling="no" style="width: 90px; margin: 0px; border: none; visibility: visible; height: 21px;display: inline;" tabindex="0" vspace="0" width="100%" src="https://apis.google.com/_/+1/fastbutton?bsv&amp;size=medium&amp;annotation=bubble&amp;url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fdownload-fb-album-mod%2Fcgjnhhjpfcdhbhlcmmjppicjmgfkppok" allowtransparency="true" data-gapiattached="true" title="+1"></iframe><iframe scrolling="no" style="border: none; overflow: hidden; height: 21px; width: 100px;display: inline;" id="f65ec7c7c" name="f3ea04f44c" title="Like this content on Facebook." class="fb_ltr" src="https://www.facebook.com/plugins/like.php?api_key=538665269519790&amp;sdk=joey&amp;channel_url=http%3A%2F%2Fstatic.ak.facebook.com%2Fconnect%2Fxd_arbiter.php%3Fversion%3D25%23cb%3Df3d10707cc%26origin%3Dchrome-extension%253A%252F%252Fnhlgnlnhdokkcfkkgcobihblljhnhkfm%252Ff223303eec%26domain%3Dnhlgnlnhdokkcfkkgcobihblljhnhkfm%26relation%3Dparent.parent&amp;href=https%3A%2F%2Fwww.facebook.com%2FDownAlbum&amp;node_type=link&amp;width=100&amp;layout=button_count&amp;colorscheme=light&amp;show_faces=false&amp;send=false&amp;extended_social_context=false"></iframe>';
}, 1000)
