Tasks = new Mongo.Collection("tasks");
Meteor.subscribe('tasks');

Template.body.events({
  "submit #add-form": function(event) {
    // Prevent default browser form submit
    event.preventDefault();

    add_task(event.target);

    // Clear form
    event.target.reset();
    $('#add-task-modal').closeModal();
  },
  "focus #add-task-frequency": function(event) {
    $('#add-task-frequency-modal').openModal();
  },
  "click #add-task-frequency-modal-choose": function(event) {

    // Prevent default browser form submit
    event.preventDefault();

    // Get values
    var form = $('#add-task-frequency-form')[0];
    var number = form.number.value;
    var timeperiod = form.timeperiod.value;

    $('#add-task-frequency').val(number + " times a " + timeperiod);

    $('#add-task-frequency-form').reset();

  },
  "click #add-task-frequency-modal-clear": function(event) {
    $('#add-task-frequency').value = "";
  }
});

Template.body.onRendered(function() {
  // default search settings
  Session.set('task_query', '');
  Session.set('task_sort', 'created-desc');
  Session.set('task_show_complete', false);

  $('.datepicker').pickadate({
    selectMonths: true,
    selectYears: 10,
    min: new Date()
  });

  // initialise collapsible
  $('.collapsible').collapsible({
    accordion: false
  })

});
