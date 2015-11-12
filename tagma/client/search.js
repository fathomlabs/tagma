
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
  var result = Tasks.find(selector, { sort: sort });
  populateStats(result);
  return result;
}

function populateStats(raw_result) {
  // Filter out completed tasks
  var result = raw_result.fetch().filter(function(t) {
    return !(t.completed);
  });

  // Number of tasks
  n_tasks = result.length;
  Session.set('n_tasks', n_tasks);

  // Number of projects
  var n_projects = _.uniq(result.map(function(t) {
    return t.project;
  })).length;
  Session.set('n_projects', n_projects);

  // Due this week
  var week_end = moment().endOf('isoWeek');
  var tasks_weekdue = result.filter(function(t) {
    var due_at = moment(t.due_at);
    return t.due_at && // has a due date
      (due_at > moment()) && // due after now
      (due_at < week_end); // due before end of week
  }).length;
  Session.set('tasks_weekdue', tasks_weekdue);

  // Overdue
  var tasks_overdue = result.filter(function(t) {
    var due_at = moment(t.due_at);
    return t.due_at && // has a due date
      (due_at < moment()) // due before now
  }).length;
  Session.set('tasks_overdue', tasks_overdue);

}

function buildRegExp(query) {
  // this is a dumb implementation
  var parts = query.trim().split(/[ \-\:]+/);
  return "(" + parts.join('|') + ")";
}
