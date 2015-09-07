Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  // This code only runs on the client

  Template.taskList.helpers({
    tasks: function () {
      return Tasks.find({});
    }
  });

  Template.taskPopout.events({
    "click .delete": function () {
      Tasks.remove(this._id);
    }
  });

  Template.taskPopout.rendered = function () {
    $('.collapsible').collapsible();
  }

  Template.body.events({
    "submit #add-form": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var title = event.target.title.value;
      var project = event.target.project.value;
      var content = event.target.content.value;


      // Insert a task into the collection
      Tasks.insert({
        title: title,
        project: project,
        content: content,
        createdAt: new Date() // current time
      });

      // Clear form
      event.target.reset();
      setTimeout(function() { $('#add-panel').hide(); }, 300);
    }
  });

}
