Tasks = new Mongo.Collection("tasks");
Meteor.publish('tasks', function() {
  return Tasks.find({});
});
