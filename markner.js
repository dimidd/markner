"use strict";
$(function() {
  changeDir();
});

function changeDir() {
  var doc = $($('#txt')[0].contentDocument)
  var pre = doc.find('pre')
  var len = pre.text().length;
  if (0 == len) {
    setTimeout(changeDir, 100)
  }
  else {
    pre.attr('dir', 'rtl');
    pre.attr('id', 'txt-pre');
    pre.attr('title', 'title-pre');
    doc = $('#txt')[0].contentDocument;
    var pre2 = doc.getElementById('txt-pre');
    $(pre2).wrapInner("<textarea id='area' title='txtarea' style='width: 300%; height: 150%;'></textarea>");
    var area = doc.getElementById('area');
    window.doc = doc;
    window.doc.addEventListener('select', function () {
      var start = area.selectionStart;
      var end = area.selectionEnd;
      var selection = area.textContent.substring(start, end);
      var ner = "<persName>" + selection + "</persName>";
      area.textContent = replaceAt(area.textContent, start, end, ner);
    });
    window.area = area;
    $('#title').tooltip({content: "crazy title", track: true});
    $(area).tooltip({content: "txt placeholder", track: true});
  }
}

function replaceAt(str, start, end, content) {
    return str.substring(0, start) + content + str.substring(end);
}
