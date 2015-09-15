// setup markdown parser to use syntax highlighting
// and Github-flavour markdown
var mark = marked;
mark.setOptions({
  gfm: true,
  tables: true,
  breaks: true,
  highlight: function (code) {
    return hljs.highlightAuto(code).value;
  }
});
Markdown = mark;
