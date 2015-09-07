if (Meteor.isClient) {
  // This code only runs on the client
  Template.taskList.helpers({
    tasks: [
      { title: "This is task 1", project: "Proj A", content: "" },
      { title: "This is task 2", project: "Proj B", content: "" },
      { title: "This is task 3", project: "Proj B", content: "" }
    ]
  });
}
