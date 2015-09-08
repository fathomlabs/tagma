Tasks = new Mongo.Collection("tasks");

if (Meteor.isServer) {
  SearchSource.defineSource('tasks', function(searchText, options) {
    var options = {sort: {isoScore: -1}, limit: 20};

    if (searchText) {
      var regExp = buildRegExp(searchText);
      var selector = {$or: [
        {title: regExp},
        {content: regExp},
        {project: regExp}
      ]};

      return Tasks.find(selector, options).fetch();
    } else {
      return Tasks.find({}, options).fetch();
    }
  });

  function buildRegExp(searchText) {
    // this is a dumb implementation
    var parts = searchText.trim().split(/[ \-\:]+/);
    return new RegExp("(" + parts.join('|') + ")", "ig");
  }
}

if (Meteor.isClient) {
  // This code only runs on the client

  var options = {
    keepHistory: 1000 * 60 * 5,
    localSearch: true
  };
  var fields = ['title', 'project', 'content'];

  TaskSearch = new SearchSource('tasks', fields, options);

  Template.taskList.helpers({
    tasks: function() {
      return TaskSearch.getData({
        transform: function(matchText, regExp) {
          return matchText;
        },
        sort: {isoScore: -1}
      });
    },

    isLoading: function() {
      return TaskSearch.getStatus().loading;
    }
  });

  Template.search.events({
    "keyup #search": _.throttle(function(event) {
      var text = $(event.target).val().trim();
      TaskSearch.search(text);
    }, 200)
  });



  Template.taskPopout.events({
    "click .delete": function(event) {
      event.stopPropagation();

      Tasks.remove(this._id);

      TaskSearch.search();
    },
    "click .guilt": function(event) {
      event.stopPropagation();

      Tasks.update(this._id, { $inc : { "guilt" : 1 } });

      TaskSearch.search();
    }
  });

  Template.taskPopout.rendered = function() {
    $('.collapsible').collapsible();
  }

  Template.body.events({
    "submit #add-form": function(event) {
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
      }, {}, function() {
        TaskSearch.search();
      });

      // Clear form
      event.target.reset();
      setTimeout(function() { $('#add-panel').hide(); }, 300);

    }
  });

  Template.body.rendered = function() {
    // load all tasks by default
    TaskSearch.search();
  };

}
