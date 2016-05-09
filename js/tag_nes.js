function tooltipsy() {
    $('.ne').tooltipster(
            {
                content: $($('#tooltip-content')[0].innerHTML),
                interactive: true,
                functionBefore: function(origin, continueTooltip) {
                    window.neElem = origin[0];
                    if (origin[0].innerText.indexOf('\n') > 0)
                       $('.ne').tooltipster('option', 'position', 'bottom-left');
                    else
                       $('.ne').tooltipster('option', 'position', 'bottom');
                        
                    continueTooltip();
                },
                position: 'bottom-left'
            });
  
}

function highlightify() {
    $(".txt-edit").highlighter({
        "selector": ".holder",
        "before" : function(data) {
          if (window.neElem != null)
            $(window.neElem).tooltipster('hide');
        },
        "complete": function(){
          if (window.neElem != null)
            $(window.neElem).tooltipster('enable');
        } 
    });

}

function initializeMarkner() {  
    // Customize this code for your needs, by setting:
    //  userHtml: an html file with your own tooltip html
    //  userCss: a matching css file
    //  neClasses: classes to be used
    window.neClasses = "persName orgName bibl placeName meeting other";
    window.userHtml = "ents.html";
    window.userCss = "./css/ents.css";
    // end of customizable section

    $('#tooltip-content').load(window.userHtml, tooltipsy);    
    $('head').append('<link rel="stylesheet" type="text/css" href="' + window.userCss + '">');    
    window.neElem = null;
    rangy.init();
    applier = rangy.createClassApplier("ne");
    highlightify();

    $('.holder').mousedown(function(){
        return false;
    });

    $('.btn-right').click(function(){
        $('.holder').hide();
        return false;
    });
}

function wrapText(txt, wrapper) {
    txt = txt.replace(/<\/?\w+>/g, '')
    if (wrapper == '') {
        return txt;
    }
    else {
      return '<'+ wrapper + '>' + txt + '</' + wrapper + '>';
    }
}

function replaceElemText(type) {
  elem = window.neElem;
  elem.innerText = wrapText(elem.innerText, type);
  $(elem).removeClass(window.neClasses);
  $(elem).addClass(type);
  $(elem).tooltipster('hide');
}

function removeWsFromSelection(fromStart) {
      selection = window.getSelection();
      range = selection.getRangeAt(0);
      if (fromStart) {
        regex = /[^\s]/;
        container = range.startContainer;
        method = range.setStart;
      }
      else {
        regex = /\s+$/;
        container = range.endContainer;
        method = range.setEnd;
      }

      match = regex.exec(selection.toString());
      if (match) {
        ind = match.index;
        if (ind > 0) {
            if (method == range.setEnd  && range.startOffset + ind >= range.endContainer.length) {
              match = regex.exec(range.endContainer.textContent);
              if (match) {
                range.setEnd(range.endContainer, match.index);
              }
            }
            else {
              // ind is the first non-ws char from the start or first ws char from the end,
              // hence (startOffset + ind)
              method.call(range, container, range.startOffset + ind);
            }
            rng = range.cloneRange();
            selection.removeAllRanges();
            selection.addRange(rng);
        }
      }
    }

function markNe() {
    removeWsFromSelection(true);
    removeWsFromSelection(false);
    applier.toggleSelection();
    tooltipsy();
    $('.holder').hide();
}

function unmarkNe() {
    $('.holder').hide();
    applier.undoToSelection();
    replaceSelectedText();
    window.neElem = null;
    highlightify();
}

function removeEmptySapns() {
    spans = $('span');
    var i = spans.length - 1;
    while (i >= 0) {
        if ( spans[i].classList.contains("ne") && spans[i].innerText == "" ) {
            spans[i].remove();
        }
        --i;
    }
}

function replaceSelectedText() {
  var sel, range, oldTxt;
  sel = window.getSelection();
  oldTxt = sel.toString();
  newTxt = oldTxt.replace(/<\/?[a-z ="]+>/g, '');
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
    var body = document.body, range, sel;
    if (body.createTextRange) {
        range = body.createTextRange();
        range.moveToElementText(el);
        range.select();
    } else if (document.createRange && window.getSelection) {
        range = document.createRange();
        range.selectNodeContents(el);
        sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
}
