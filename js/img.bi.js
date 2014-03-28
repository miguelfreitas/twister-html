function imgBiJS() {
  var elems = document.querySelectorAll('[data-imgbi]');
  i = elems.length;
  while (i--) {
    var params = elems[i].dataset.imgbi.split('!');
    imgBiJSDownload(params[0].replace('#','') + 'download/' + params[1], params[2], elems[i], new XMLHttpRequest());
  }
}
function imgBiJSDownload(url, pass, elem, request) {
  request.open('GET', url);
  request.onload = function() {
    if (request.status == 200) {
      var result = sjcl.decrypt(pass,request.responseText);
      if (result) {
        elem.src = result;
      }
      else {
        console.log('Failed to decrypt image');
      }
    }
    else {
      console.log('Failed to load image');
    }
  };
  request.send(null);
}
