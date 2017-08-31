'use strict';

// TODO: use jquery data instead of globals

//  userHtml: an html file with your own tooltip html
//  userCss: a matching css file
//  neClasses: a space separated list of classes to be used
//    E.g. "person place event"
const initMarkner = function(neClasses, userHtml, userCss, preMark) {
  window.neClasses = neClasses;
  window.preMark = preMark;
  $('#tooltip-content').load(userHtml, tooltipsy);
  $('head').append('<link rel="stylesheet" type="text/css" href="' + userCss + '">');
  window.neElem = null;
  rangy.init();
  window.applier = rangy.createClassApplier("ne");
  highlightify();

  $('.holder').mousedown(function() {
    return false;
  });

  $('.btn-right').click(function() {
    $('.holder').hide();
    return false;
  });
}

function tooltipsy() {
  $('.ne').tooltipster({
    content: $($('#tooltip-content')[0].innerHTML),
    interactive: true,
    functionBefore: function(instance, helper) {
      window.neElem = helper.origin;
      return true;
    },
    side: 'right',
    contentCloning: 'true'
  });

}

function highlightify() {
  $(".txt-edit").highlighter({
    "selector": ".holder",
    "before": function(data) {
      if (window.neElem) {
        hide($(window.neElem));
      }
    },
    "complete": function() {
      if (window.neElem) {
        enable($(window.neElem));
      }
    }
  });

}

function wrapText(txt, wrapper) {
  const txt2 = unXml(txt);
  if (wrapper == '') {
    return txt2;
  } else {
    return '<' + wrapper + '>' + txt2 + '</' + wrapper + '>';
  }
}

function replaceElemText(type) {
  window.neElem.innerText = wrapText(window.neElem.innerText, type);
  $(window.neElem).removeClass(window.neClasses);
  $(window.neElem).addClass(type);
  if (window.neElem) {
    hide($(window.neElem));
  }
}

function removeWsFromSelection() {
  rangy.getSelection().trim();
}

function markNe() {
  window.preMark();
  removeWsFromSelection();
  window.applier.toggleSelection();
  tooltipsy();
  $('.holder').hide();
}

function unmarkNe(isSel) {
  $('.holder').hide();
  if (isSel) {
    // FIXME
    // replaceSelectedText();
    //  applier.undoToSelection();
  } else {
    replaceElemText('');
    $(window.neElem.childNodes[0]).unwrap();
  }
}


// TODO: use map instead of a loop
function removeEmptySapns() {
  const spans = $('span');
  var i = spans.length - 1;
  while (i >= 0) {
    if (spans[i].classList.contains("ne") && spans[i].innerText == "") {
      spans[i].remove();
    }
    --i;
  }
}

function replaceSelectedText() {
  const sel = window.getSelection();
  const oldTxt = sel.toString();
  const newTxt = unXml(oldTxt);
  if (newTxt.length < oldTxt.length) {
    $(sel.anchorNode.parentElement).replaceWith(newTxt);
    // TODO: dirty hack, the empty span afrter the non-ne should be deleted w/o/ traversing all spans
    removeEmptySapns();
  }
}

function replaceAt(str, start, end, content) {
  return str.substring(0, start) + content + str.substring(end);
}

//http://stackoverflow.com/a/2075598/165753
function selectElementContents(el) {
  const body = document.body;
  if (body.createTextRange) {
    const range = body.createTextRange();
    range.moveToElementText(el);
    range.select();
  } else if (document.createRange && window.getSelection) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function unXml(txt) {
  return txt.replace(/<\/?[a-zA-Z ="]+>/g, '');
}

function enable(selector) {
  selector.filter(function() {
    return $(this).data('tooltipsterNs');
  }).tooltipster('enable');
}


// https://stackoverflow.com/questions/27709489/jquery-tooltipster-plugin-hide-all-tips
function hide(selector) {
  selector.filter(function() {
    return $(this).data('tooltipsterNs');
  }).tooltipster('hide');
}
