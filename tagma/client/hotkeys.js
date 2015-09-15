globalHotkeys = new Hotkeys();

globalHotkeys.add({
  combo : "n",
  callback : function(){
    $('#add-task-modal').openModal();
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
