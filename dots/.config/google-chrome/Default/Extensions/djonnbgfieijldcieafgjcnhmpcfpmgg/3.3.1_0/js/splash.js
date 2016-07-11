(function(){

  var loadScript = function(src, load, async) {
    console.time("load script: " + src);
    var script = document.createElement('script');
    script.src = src;
    script.async = async || false;
    script.onload = function() {
      console.timeEnd("load script: " + src);
      if (load) load();
    };
    document.head.appendChild(script);
  };

  var loadCSS = function(src) {
    var css = document.createElement('link');
    css.setAttribute('rel', 'stylesheet');
    css.href = src;
    document.head.appendChild(css);
  };

  var guid = function() {
    var s4 = function(){
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  };

  var SCRIPT = document.getElementById("script");
  window.VERSION = SCRIPT.dataset.version;
  window.ENVIRONMENT = SCRIPT.dataset.env;
  window.BUILD = SCRIPT.dataset.build;
  window.USER_ID = null;
  window.CLIENT_ID = '613550366583-85breijs3gubkip5t6u6k4s0tdbhc48f.apps.googleusercontent.com';
  window.URL_PARAMS = {};
  window.BLOCK_FEATURES = false;

  if (BUILD === 'osx-lite' || BUILD === 'windows-lite') {
    window.BLOCK_FEATURES = true
  }

  (function(){
    var urlParams = location.search ? location.search.split("?")[1].split("&") : [];
    for (var i = 0; i < urlParams.length; i++) {
      var pair = decodeURIComponent(urlParams[i]).split('=');
      URL_PARAMS[pair[0]] = pair[1]
    }
  }());

  window.WebGLSupport = (function(){
    var gl, canvas = document.createElement('canvas');

    if (!window.WebGLRenderingContext) {
      // no webgl
      return 0;
    }

    try { gl = canvas.getContext('webgl'); }
    catch (e) { gl = null; }
    try { gl = canvas.getContext('experimental-webgl'); }
    catch (e) { gl = null; }

    if (!gl) {
      // webgl disabled
      return 1;
    }

    var highp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    if (highp.precision == 0) {
      // highp not supported
      return 2;
    }

    return 3;
  }());

  window.gapiReady = new Promise(function(resolve) {
    var handleAuth = function(res) {
      if (res.error) {
        authorize(false, handleAuth);
      } else {
        resolve(res);
      }
    };

    var authorize = function(immediate, callback) {
      gapi.auth.authorize(
        {
          'client_id': CLIENT_ID,
          'scope': 'https://www.googleapis.com/auth/drive.file',
          'immediate': immediate
        }, callback);

    };

    window.checkAuth = function() {
      authorize(true, handleAuth);
    }
  });


  window.gravitReady = new Promise(function(resolve, reject){
    window.loadGravit = function() {
      loadScript('https://cdn.gravit.io/gravit/api/gravit-client-api.js', function(){
        window.gravit = new GApi('https://gravit.io/api', URL_PARAMS.gravit_sid);
        resolve(window.gravit);
      });
    }
  });

  loadStripe = function() {
    window.StripeReady = new Promise(function(resolve){
      loadScript("https://checkout.stripe.com/checkout.js", resolve);
    });
  };

  var splash = document.getElementById("splash");
  var progressBar = document.getElementById("splash-progress");
  var logo = document.getElementById("splash-logo");
  var img = document.getElementById("splash-logo-img");
  var splashButton = document.getElementById("splash-action-clear");

  splashButton.onclick = function(e) {
    e.preventDefault();
    Actions.photos.removeAllPhotos();
    setTimeout(function(){
      location.reload();
    }, 300);
  };

  window.splashScreen = {
    hide: function() {
      splash.style.opacity = 0;
      setTimeout(function(){
        splash.remove();
      }, 300);
      splashScreen.setProgress(100);
    },
    setProgress: function(progress) {
      progress = Math.max(progress, parseInt(progressBar.style.width) || 0);
      progressBar.style.width = progress + "%";
      if (progress === 80 && !(BUILD === 'osx' || BUILD === 'osx-lite' || BUILD === 'osx-embedded')) {
        setTimeout(function() {
          splashButton.style.display = "inline-block"
        }, 1000 * 10);
      }
      if (progress === 100) appLoaded()
    }
  };

  img.onload = function() {
    setTimeout(function(){
      img.style.opacity = 1;
      logo.style.webkitFilter = "saturate(1)";
      logo.style.filter = "saturate(1)";

      // prevent right click
      window.addEventListener("contextmenu", function(e){
        e.preventDefault();
      });

      setProgress = function() {
        splashScreen.setProgress(this);
      };

      /* uses timestamp to prevent caching */
      loadCSS('css/style.css?'+ +new Date);

      if (typeof WinJS !== 'undefined') {
        // No async loading of the scripts
        // on a windows app, otherwise it will hang
      } else if (BUILD === 'osx' || BUILD === 'osx-lite' || BUILD === 'osx-embedded') {
        loadScript('ipc.js');
        loadScript('js/lightgl.js', setProgress.bind(20));
        loadScript('js/dev/editor.js', setProgress.bind(80));
        if (BUILD === 'osx' || BUILD === 'osx-embedded'){
          // fire user activation for OSX app users Note only osx-paid app has embedded photo extension
          var xmlHttp = new XMLHttpRequest();
          xmlHttp.open("GET", "https://www.polarr.co/analytics/activate", true); // true for asynchronous
          xmlHttp.send(null);
        }
      } else if (ENVIRONMENT === 'windows') {
        // fire user activation for Windows app users
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", "https://www.polarr.co/analytics/activate", true); // true for asynchronous
        xmlHttp.send(null);
      } else if (ENVIRONMENT === 'development') {
        loadScript('js/lightgl.js', setProgress.bind(20));
        loadScript('js/dev/editor.js', setProgress.bind(50));
        loadScript('js/dev/dcraw_bundle.js', setProgress.bind(80));
      } else {
        loadScript('js/lightgl.js', setProgress.bind(20));
        loadScript('js/bundle.js', setProgress.bind(80));
      }

      if (BUILD === 'web') {
        // load drive api
        if (URL_PARAMS.state) {
          loadScript('https://apis.google.com/js/client.js?onload=checkAuth');
        }

        // load gravit api
        if (URL_PARAMS.gravit_sid) {
          loadGravit();
        }

        // load Filepicker.io
        (function(a){
          var b=a.createElement("script");
          window.filepickerReady = new Promise(function(r){b.onload=r});
          b.type="text/javascript";
          b.async=!0;
          b.src="https://api.filepicker.io/v2/filepicker.js";
          if (typeof WinJS !== 'undefined') {
            b.src = '/js/filepicker.js';
          }
          var c=a.getElementsByTagName("script")[0];
          c.parentNode.insertBefore(b,c);
          var d={};d._queue=[];
          var e="pick,pickMultiple,pickAndStore,read,write,writeUrl,export,convert,store,storeUrl,remove,stat,setKey,constructWidget,makeDropPane".split(",");
          var f=function(a,b){return function(){b.push([a,arguments])}};
          for(var g=0;g<e.length;g++){d[e[g]]=f(e[g],d._queue)}
          window.filepicker=d
        })(document);

        // load Facebook events
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','//connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1684098078478481');
        fbq('track', "PageView");

        loadStripe();
      }

      
    }, 1);
  };

  var storage = {
    getItem: function (key, callback) {
      if (BUILD === 'chrome') {
        chrome.storage.local.get(key, function (obj) {
          callback(obj[key]);
        });
      } else {
        callback(localStorage.getItem(key));
      }
    },
    setItem: function (key, value, callback) {
      if (BUILD === 'chrome') {
        var obj = {};
        obj[key] = value;
        chrome.storage.local.set(obj, callback);
      } else {
        value = localStorage.setItem(key, value);
        if (callback) callback(value);
      }
    }
  };

  var appLoaded = function() {
    // Configure GA tracking for Web, Chrome, Windows Paid, Lite, Eletron, OSX Paid, Lite, Embedded
    // We are using UA-53563114-2 for Google Chrome in google-analytics-bundle-polarr-mod.js
    if (BUILD !== 'chrome') {
      // Default to web
      var gaSrc = 'https://www.google-analytics.com/analytics.js';
      var UA = 'UA-53563114-15';
      if (BUILD === 'windows' || BUILD === 'windows-lite' || BUILD === 'windows-electron') {
        // For windows store distribution, we have to host analytics seperately
        if (BUILD === 'windows' || BUILD === 'windows-lite') {
          gaSrc = '/js/analytics.js';
        }
        UA = 'UA-53563114-11';
      }else if (BUILD === 'osx' || BUILD === 'osx-lite' || BUILD === 'osx-embedded') {
        UA = 'UA-53563114-12';
      }else{ // BUILD is web or anything else
        UA = 'UA-53563114-15';
      }
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script',gaSrc,'ga');

      ga('create', UA, 'auto');
      ga('set', 'checkProtocolTask', null);
      ga('send', 'pageview');
    }
    
    storage.getItem("ppe_user_id", function(uuid) {
      if (uuid == null) {
        uuid = guid();
        storage.setItem("ppe_user_id", uuid);
      }
      if (typeof ga !== "undefined" && ga) {
        ga('set', '&uid', uuid);
      }
      window.USER_ID = uuid;
    });

    if (BUILD === 'web') {
      // Load twitter widget
      !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
    }

  }

  var logo_en = "img/logo-large.png";
  var logo_cn = "img/logo-large.png";

  var lang = (window.navigator.userLanguage || window.navigator.language).toLowerCase();

  if (lang.match(/zh|cn|tw|hk/)) {
    img.src = logo_cn;
    document.title = "泼辣修图";
  } else {
    img.src = logo_en;
  }

  window.LOGO_BASE64 = img.src;

})();
