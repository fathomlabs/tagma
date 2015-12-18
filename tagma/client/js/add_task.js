Template.addTaskModal.onRendered(function() {
  AutoCompletion.init("#add-task-project");
});

Template.addTaskModal.events = {
  'keyup #add-task-project': function () {
    AutoCompletion.autocomplete({
      element: '#add-task-project',
      collection: Tasks,
      field: 'project',
      limit: 10
    }, _.uniq);
  }
}

Template.addTaskFrequencyModal.onRendered(function() {
  this.$('select').material_select();
});
