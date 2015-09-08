SearchSource.defineSource('tasks', function(searchText, options) {
  var options = {sort: {isoScore: -1}, limit: 20};

  if (searchText) {
    var regExp = buildRegExp(searchText);
    var selector = {$or: [
      {title: regExp},
      {content: regExp},
      {project: regExp}
    ]};

    return Tasks.find(selector, options).fetch();
  } else {
    return Tasks.find({}, options).fetch();
  }
});

function buildRegExp(searchText) {
  // this is a dumb implementation
  var parts = searchText.trim().split(/[ \-\:]+/);
  return new RegExp("(" + parts.join('|') + ")", "ig");
}
