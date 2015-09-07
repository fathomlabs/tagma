Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  // This code only runs on the client

  Template.taskList.helpers({
    tasks: function () {
      return Tasks.find({});
    }
  });

  Template.taskPopout.events({
    "click .delete": function (event) {
      event.stopPropagation();

      Tasks.remove(this._id);
    },
    "click .guilt": function (event) {
      event.stopPropagation();

      Tasks.update(this._id, { $inc : { "guilt" : 1 } });
    }
  });

  Template.taskPopout.rendered = function () {
    $('.collapsible').collapsible();
  }

  Template.body.events({
    "submit #add-form": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      console.log(event.type);

      // Get value from form element
      var title = event.target.title.value;
      var project = event.target.project.value;
      var content = event.target.content.value;


      // Insert a task into the collection
      Tasks.insert({
        title: title,
        project: project,
        content: content,
        guilt: 0,
        createdAt: new Date() // current time
      });

      // Clear form
      event.target.reset();
      setTimeout(function() { $('#add-panel').hide(); }, 300);
    }
  });

}
