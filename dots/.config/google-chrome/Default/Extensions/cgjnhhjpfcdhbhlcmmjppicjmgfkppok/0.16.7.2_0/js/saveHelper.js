function quickSelect(s) {
  var method = false;
  switch (s) {
    case /#\w+$/.test(s):
      method = 'getElementById'; break;
    case /\.\w+$/.test(s):
      method = 'getElementsByClassName'; break;
  }
  return method;
}
function qS(s) { var k = document[quickSelect(s) || 'querySelector'](s); return k && k.length ? k[0] : k;}
function qSA(s) { return document[quickSelect(s) || 'querySelectorAll'](s);}
function parseFbSrc(s, fb) {
  if (fb) {
    return s.replace(/s\d{3,4}x\d{3,4}\//g, '');
  } else {
    return s.replace(/\w\d{3,4}x\d{3,4}\//g, '');
  }
}

if(location.href.match("instagram.com")){
  if(!window.addedObserver){
    window.addedObserver = true;
    var o = window.WebKitMutationObserver || window.MutationObserver;
    var observer = new o(runLater);
    observer.observe(document.body, {subtree: true, childList: true});
  }
}

function _download(href){
  var link = document.createElement('a');
  link.href = href;
  link.download = "";
  link.click();
}

function runLater(){
  clearTimeout(window.addLinkTimer);
  window.addLinkTimer = setTimeout(addLink, 300);
}

function addLink(){
  var k = qSA('article>div:nth-of-type(1), header>div:nth-of-type(1)');
  for(var i = 0; i<k.length; i++){
    if (k[i].nextElementSibling) {
      _addLink(k[i], k[i].nextElementSibling);
    }
  }
  var k = qSA('header');
  for(var i = 0; i<k.length; i++){
    _addLink(k[i], k[i]);
  }
}

function _addLink(k, target) {
  var isProfile = (k.tagName == 'HEADER' || k.parentNode.tagName == 'HEADER');
  var tParent = target.parentNode;
  if (tParent.querySelectorAll('img').length > 2) {
    return;
  }
  var t = k.querySelector('img, video');
  if (t) {
    var src = parseFbSrc(t.getAttribute("src"));
    if (qS('.dLink [href="' + src + '"]')) {
      return;
    }
    var next = isProfile ? target.querySelector('.dLink') : 
      target.nextElementSibling;
    if (next) {
      if (next.childNodes[0] &&
        next.childNodes[0].getAttribute('href') == src) {
        return;
      } else {
        (isProfile ? target : tParent).removeChild(next);
      }
    }
  }
  if (t && src) {
    var link = document.createElement('div');
    link.className = 'dLink';
    var title = '(provided by Download FB Album mod)';
    var html = '<a href="' + src + '" download title="' + title + '">Download';
    if (src.match('mp4')) {
      var poster = t.getAttribute('poster');
      html += ' Video</a><a href="' + poster + '" download  title="' + title +
        '">Download Photo</a>';
    } else {
      html += '</a>';
    }
    link.innerHTML = html;
    if (isProfile) {
      k.appendChild(link);
    } else if (target.insertAdjacentElement) {
      target.insertAdjacentElement("afterEnd", link);
    } else {
      if (target.nextSibling) {
        tParent.insertBefore(link, target.nextSibling);
      } else {
        tParent.appendChild(link);
      }
    }
  }
}
