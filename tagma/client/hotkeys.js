globalHotkeys = new Hotkeys();

// new task
globalHotkeys.add({
  combo : "n",
  callback : function(){
    $('#add-task-modal').openModal({
      in_duration: 200,
      out_duration: 200,
      ready: function() {
        $('input[name="title"]').delay(205).focus();
      }
    });
    return false;
  }
});

// focus search
globalHotkeys.add({
  combo : "/",
  callback : function(){
    var searchbar = $('#search');
    var val = searchbar.val();
    console.log(val);
    searchbar.focus();
    return false;
  }
});

// toggle guilt-mode
globalHotkeys.add({
  combo : "g",
  callback : function(){
    var task_sort = Session.get('task_sort');
    if (task_sort === 'guilt-desc') {
      Session.set('task_sort', 'created-desc');
      Materialize.toast('Guilt mode off', 2000, 'buttered-toast')
    } else {
      Session.set('task_sort', 'guilt-desc');
      Materialize.toast('Guilt mode on', 2000, 'buttered-toast')
    }
    return false;
  }
});
