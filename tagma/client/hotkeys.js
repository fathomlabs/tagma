globalHotkeys = new Hotkeys();

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
  }
});

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
