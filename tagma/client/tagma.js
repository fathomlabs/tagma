
var sorts = {
  'created-desc': { created_at: -1 },
  'created-asc': { created_at: 1 },
  'guilt-desc': { guilt: -1 }
}
function searchTasks(query) {
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
  return Tasks.find(selector, { sort: sort });
}
function buildRegExp(query) {
  // this is a dumb implementation
  var parts = query.trim().split(/[ \-\:]+/);
  return "(" + parts.join('|') + ")";
}


// setup markdown parser to use syntax highlighting
// and Github-flavour markdown
var mark = marked;
mark.setOptions({
  gfm: true,
  tables: true,
  breaks: true,
  highlight: function (code) {
    return hljs.highlightAuto(code).value;
  }
});
Markdown = mark;

Template.taskList.helpers({
  tasks: function() {
    var query = Session.get('task_query') || '';
    return searchTasks(query);
  }
});

Template.search.events({
  "keyup #search": _.throttle(function(event) {
    var text = $(event.target).val().trim();
    Session.set('task_query', text);
  }, 200)
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

Template.actionButton.onRendered(function() {
  this.$('.modal-trigger').leanModal();
});

Template.actionButton.events({
  "click #add-task-btn": function(event) {
    // $('#add-task-panel').openModal();
    $('#add-task-btn').closeFAB();
  }
});

Template.addTaskFrequencyModal.onRendered(function() {
  this.$('select').material_select();
});

Template.taskPopout.events({
  "escaped-click .task-complete": function(event) {
    event.stopPropagation();

    Tasks.update(this._id, {
      '$set': {
        'completed': !this.completed
      }
    });
    this.completed = !this.completed;
  },
  "escaped-click .task-delete": function(event) {
    event.stopPropagation();

    Tasks.remove(this._id);
  },
  "escaped-click .task-guilt": function(event) {
    event.stopPropagation();

    Tasks.update(this._id, { $inc : { "guilt" : 1 } });
  },
  "escaped-click .task-edit": function(event) {
    event.stopPropagation();
    event.preventDefault();

    var containerid = this._id + '_content';

    var container = $('#' + containerid);

    if (container.hasClass('with-editor')) {

      // get contents of editor, then destroy it
      var textarea = container.parent().find('textarea');
      var content = $.trim(textarea.val());
      textarea.remove();
      container.find('iframe').remove();

      // update the task popout contents and resize
      container.html(Markdown(content));
      container.removeClass('with-editor');
      container.css({ height: 'auto' });

      Tasks.update(this._id, { '$set': { 'content': content }});
      this.content = content;

    } else {
      var opts = {
        basePath: '/epic',
        theme: {
          base: '/base.css',
          editor: '/editor.css'
        },
        preloadText: this.content,
        autogrow: true,
        focusOnLoad: true,
        button: false
      }
      Epic.create(containerid, opts);
      container.find('iframe').css({ height: 'auto' });
      $('#epicarea' + containerid).hide();
      container.addClass('with-editor');
    }

    return false;
  }
});

Template.taskPopout.onRendered(function() {
  // initialise collapsible
  $('.collapsible').collapsible()
  // initialise tooltips
  $('.tooltipped').tooltip({
    delay: 0
  });

  // hackety-hack - don't collapse the task if user clicks
  // on the buttons
  var buttons = this.$('.task-btns > a');

  buttons.on('click.collapse', function(e) {
    e.stopPropagation();
    $(e.target).trigger('escaped-click');
  });

  buttons.mouseover(function() {
    $(this).removeClass('text-lighten-3');
  });

  buttons.mouseout(function() {
    $(this).addClass('text-lighten-3');
  });

  this.$('.task-content p').addClass('flow-text');

});

Template.body.events({
  "submit #add-form": function(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    var title = event.target.title.value;
    var project = event.target.project.value;
    var content = event.target.content.value;
    var duedate = event.target.duedate.value;
    var frequency = event.target.frequency.value;

    if (duedate.length = 0) {
      duedate = undefined;
    }

    // Insert a task into the collection
    Tasks.insert({
      title: title,
      project: project,
      content: content,
      guilt: 0,
      completed: false,
      due_at: duedate,
      frequency: frequency,
      created_at: new Date() // current time
    });

    // Clear form
    event.target.reset();
    $('#add-task-modal').closeModal();
  },
  "focus #add-task-frequency": function(event) {
    $('#add-task-frequency-modal').openModal();
  },
  "click #add-task-frequency-modal-choose": function(event) {
    console.log(event);
    // Prevent default browser form submit
    event.preventDefault();

    // Get values
    var form = $('#add-task-frequency-form')[0];
    console.log(form);
    var number = form.number.value;
    var timeperiod = form.timeperiod.value;

    $('#add-task-frequency').val(number + " times a " + timeperiod);

    $('#add-task-frequency-form').reset();
  },
  "click #add-task-frequency-modal-clear": function(event) {
    $('#add-task-frequency').value = "";
  }
});

Template.body.rendered = function() {
  Session.set('task_query', '');
  Session.set('task_sort', 'created-desc');
  Session.set('task_show_complete', false);
  $('.datepicker').pickadate({
    selectMonths: true,
    selectYears: 10,
    min: new Date()
  });
};
