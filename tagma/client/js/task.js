Template.task_header_buttons.events({
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

      finish_editing_task(this);

    } else {

      start_editing_task(this);

    }

    return false;
  }
});

Template.task_header_info.helpers({
  hasProject: function() {
    return !!this.project && this.project.length > 0;
  },
  overdue: function() {
    return !!this.due_at && !this.completed &&
           (+(new Date(this.due_at)) < +(new Date()));
  },
  overdueBy: function() {
    var due_at = moment(new Date(this.due_at));
    var now = moment(new Date());
    var daysover = now.diff(due_at, 'days');
    return daysover ?
      daysover + ' days overdue' :
      'due today';
  }
});

Template.task_popout.onRendered(function() {

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

add_task = function(form) {

  // Get value from form element
  var title = form.title.value;
  var project = form.project.value;
  var content = form.content.value;
  var duedate = form.duedate.value;
  var frequency = form.frequency.value;

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

}

start_editing_task = function(task) {

  var containerid = task._id + '_content';
  var container = $('#' + containerid);

  // show editing badge
  $('#' + task._id + '-editing-badge').show();

  // switch to save icon
  $('#' + task._id + '-edit-button i').text('save');

  // show metadata edit form
  var metadataid = task._id + '_metadata';
  $('#' + metadataid).show('slow');

  var opts = {
    basePath: 'editor/',
    theme: {
      base: 'base.css',
      editor: 'editor.css'
    },
    preloadText: task.content,
    autogrow: true,
    focusOnLoad: true,
    button: false
  }

  Epic.create(containerid, opts);
  container.find('iframe').css({ height: 'auto' });
  $('#epicarea' + containerid).hide();
  container.addClass('with-editor');
  container.css({ 'border-width': '1px' });

}

finish_editing_task = function(task) {

  var containerid = task._id + '_content';
  var container = $('#' + containerid);

  save_task_metadata(task);

  // remove editing badge
  $('#' + task._id + '-editing-badge').hide();

  // switch to edit icon
  $('#' + task._id + '-edit-button i').text('edit');

  // get contents of editor, then destroy it
  var textarea = container.parent().find('textarea');
  var content = $.trim(textarea.val());
  textarea.remove();
  container.find('iframe').remove();

  // update the task popout contents and resize
  container.html(Markdown(content));
  container.removeClass('with-editor');
  container.css({ height: 'auto', 'border-width': '0' });

  Tasks.update(task._id, { '$set': { 'content': content }});
  task.content = content;

}

save_task_metadata = function(task) {

  // hide metdata edit form
  var metadataid = task._id + '_metadata';
  $('#' + metadataid).hide('slow');

  var form = $('#' + metadataid + '-form')[0];
  var title = form.title.value;
  var project = form.project.value;
  var due_at = form.due_at.value;
  var frequency = form.frequency.value;

  // Update the task in the database
  Tasks.update(
    task._id,
    { '$set': {
      title: title,
      project: project,
      due_at: due_at,
      frequency: frequency
    }
  });

}

Template.task_metadata.onRendered(function() {
  $('.datepicker').pickadate({
    selectMonths: true,
    selectYears: 10,
    min: new Date()
  });
})

Template.task_metadata.events({
  "focus .edit-task-frequency": function(event) {
    var input_id = event.target.id;
    dropdown_freq_editor(event.target);
  },
  'keyup .edit-task-project': function (event) {
    AutoCompletion.autocomplete({
      element: '#' + event.target.id,
      collection: Tasks,
      field: 'project',
      limit: 10
    }, _.uniq);
  }
});

frequency_from_string = function(str) {
  var freq = str.split('times a').map(function(x) {
    return (x && x.trim().length > 0) ? x.trim() : undefined;
  });

  return {
    times: freq[0],
    period: freq[1]
  };
}

dropdown_freq_editor = function(element) {
  var box = element.getBoundingClientRect;
  var left = box.left;
  var top = box.top + box.height;

  var data = frequency_from_string(element.value);
  console.log(data);

  var dropdown = $("<div></div>").appendTo($(element).parent());

  dropdown.css({
    position: 'absolute',
    left: left,
    top: top,
    'background-color': 'white',
    'border-width': '1px',
    'border-style': 'solid',
    'border-radius': '2px',
    'min-width': '290px',
    'padding-top': '10px',
    'padding-bottom': '10px',
    display: 'none'
  });

  Blaze.renderWithData(
    Template.edit_task_freq_dropdown,
    data,
    dropdown[0]
  );

  // activate the select dropdown
  $('select', dropdown).material_select();
  if (data.period) {
    $('.select-dropdown', dropdown).val(data.period).change();
    $('.select-dropdown', dropdown).attr('value', data.period);
    $('select', dropdown).val(data.period).change();
  }

  // register 'clear' and 'choose' buttons
  $('.edit-task-frequency-dd-choose', dropdown)
    .on('click', function(event) {

    // prevent default browser form submit
    event.preventDefault();

    // get values
    var form = $('.edit-task-frequency-form', dropdown)[0];
    var number = form.number.value;
    var timeperiod = form.timeperiod.value;

    if (number && timeperiod) {
      $(element).val(number + " times a " + timeperiod);

      $('form', dropdown)[0].reset();

      dropdown.hide('fast');
      dropdown.remove();
    }

  });

  $('.edit-task-frequency-dd-clear', dropdown)
    .on('click', function(event) {

    $(element).val('');

    dropdown.hide('fast');
    dropdown.remove();
  });

  // show the dropdown, dismissing it if the user clicks outside the task
  dropdown.show('fast', function() {

    $(document).on('click', function (e) {
      if ($(e.target).closest(dropdown).length === 0) {
        dropdown.hide('fast');
        dropdown.remove();
      }
    });
  });

}
