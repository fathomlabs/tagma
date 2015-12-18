Template.actionButton.onRendered(function() {
  this.$('.modal-trigger').leanModal({
    in_duration: 200,
    out_duration: 200,
    ready: function() {
      $('input[name="title"]').delay(205).focus();
    }
  });
});

Template.actionButton.events({
  "click #add-task-btn": function(event) {
    $('#add-task-btn').closeFAB();
  }
});
