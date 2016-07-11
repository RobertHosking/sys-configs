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

var userId;
var timeline = qS('#pagelet_timeline_main_column');
try {
  if (timeline) {
    userId = JSON.parse(timeline.getAttribute('data-gt')).profile_owner;
  }
} catch(e) {}

var cover = qS('.coverWrap') || qS('.coverImage');
try {
  if (cover && !userId) {
    userId = cover.href.match(/set=([\w\d\.]+)/)[1].split('.')[3];
  }
} catch(e) {}

if (userId) {
  location.href = 'https://www.facebook.com/search/' + userId +
    '/photos-of/intersect';
}
