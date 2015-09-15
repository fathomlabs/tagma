
var sorts = {
  'created-desc': { created_at: -1 },
  'created-asc': { created_at: 1 },
  'guilt-desc': { guilt: -1 }
}

searchTasks = function(query) {
  var selector = {}
  if (query && query.length > 0) {
    var regExp = buildRegExp(query);
    selector = {
      $or: [
        { title: { $regex: regExp } },
        { content: { $regex: regExp } },
        { project: { $regex: regExp } }
      ]
    };
  }
  var showComplete = Session.get('task_show_complete');
  if (!showComplete) {
    selector = {
      $and: [
        { completed: false },
        selector
      ]
    }
  }
  var sort = sorts[Session.get('task_sort')] || { created_at: -1 };
  return Tasks.find(selector, { sort: sort });
}

function buildRegExp(query) {
  // this is a dumb implementation
  var parts = query.trim().split(/[ \-\:]+/);
  return "(" + parts.join('|') + ")";
}
