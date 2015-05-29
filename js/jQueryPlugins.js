// following replacement of the native setTimeout() and setInterval()
// enables the passage of the 'this' object through the JavaScript timers
// and enables the HTML5 standard passage of arbitrary arguments to the
// callback functions of timers in IE9 and other old browsers (like some of mobile ones).
// see https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout#A_possible_solution
var __nativeST__ = window.setTimeout, __nativeSI__ = window.setInterval;

window.setTimeout = function (vCallback, nDelay) {  // additional arguments will be passed
    var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
    return __nativeST__(vCallback instanceof Function ?
        function () {vCallback.apply(oThis, aArgs);} : vCallback, nDelay);
};

window.setInterval = function (vCallback, nDelay) {  // additional arguments will be passed
    var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
    return __nativeSI__(vCallback instanceof Function ?
        function () {vCallback.apply(oThis, aArgs);} : vCallback, nDelay);
};

// bind callback function for event of clicking outside of element
(function(jQuery) {
   jQuery.fn.clickoutside = function(callback) {
      var outside = 1, self = $(this);
      self.cb = callback;
      this.click(function() {
         outside = 0;
      });
      $(document).click(function() {
         outside && self.cb();
         outside = 1;
      });
      return $(this);
   }
})(jQuery);

// get caret position
(function($) {
  $.fn.caret = function(pos) {
    var target = this[0];
    var isContentEditable = target.contentEditable === 'true';
    //get
    if (arguments.length == 0) {
      //HTML5
      if (window.getSelection) {
        //contenteditable
        if (isContentEditable) {
          target.focus();
          var range1 = window.getSelection().getRangeAt(0),
              range2 = range1.cloneRange();
          range2.selectNodeContents(target);
          range2.setEnd(range1.endContainer, range1.endOffset);
          return range2.toString().length;
        }
        //textarea
        return target.selectionStart;
      }
      //IE<9
      if (document.selection) {
        target.focus();
        //contenteditable
        if (isContentEditable) {
            var range1 = document.selection.createRange(),
                range2 = document.body.createTextRange();
            range2.moveToElementText(target);
            range2.setEndPoint('EndToEnd', range1);
            return range2.text.length;
        }
        //textarea
        var pos = 0,
            range = target.createTextRange(),
            range2 = document.selection.createRange().duplicate(),
            bookmark = range2.getBookmark();
        range.moveToBookmark(bookmark);
        while (range.moveStart('character', -1) !== 0) pos++;
        return pos;
      }
      // Addition for jsdom support
      if (target.selectionStart)
        return target.selectionStart;
      //not supported
      return 0;
    }
    //set
    if (pos == -1)
      pos = this[isContentEditable? 'text' : 'val']().length;
    //HTML5
    if (window.getSelection) {
      //contenteditable
      if (isContentEditable) {
        target.focus();
        window.getSelection().collapse(target.firstChild, pos);
      }
      //textarea
      else
        target.setSelectionRange(pos, pos);
    }
    //IE<9
    else if (document.body.createTextRange) {
      if (isContentEditable) {
        var range = document.body.createTextRange();
        range.moveToElementText(target);
        range.moveStart('character', pos);
        range.collapse(true);
        range.select();
      } else {
        var range = target.createTextRange();
        range.move('character', pos);
        range.select();
      }
    }
    if (!isContentEditable)
      target.focus();
    return pos;
  }
})(jQuery);
