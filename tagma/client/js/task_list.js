
Template.task_list.helpers({
  tasks: function() {
    var query = Session.get('task_query') || '';
    return searchTasks(query);
  }
});

Template.stats.helpers({
  ntasks: function() {
    return Session.get('n_tasks');
  },
  nprojects: function() {
    return Session.get('n_projects');
  },
  weekdue: function() {
    return Session.get('tasks_weekdue');
  },
  overdue: function() {
    return Session.get('tasks_overdue');
  }
});

Template.sortAndFilter.events({
  'change #sort-radiogroup input': function(event) {
    var sort = $('#sort-radiogroup input[name=sort]:checked').val();
    console.log('clicky', sort);
    Session.set('task_sort', sort.replace('sort-', ''));
    $('#sort-dropdown').mouseout();
  },
  'change #filter-show-checked': function(event) {
    var show = $('#filter-show-checked').is(":checked");
    Session.set('task_show_complete', show);
    console.log(show);
  }
});
