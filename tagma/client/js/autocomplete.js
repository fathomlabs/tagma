// Modified from https://github.com/sebdah/meteor-autocompletion
//
// The MIT License (MIT)
//
// Copyright (c) 2013 Sebastian Dahlgren
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var log = function (level, message) {
  if (AutoCompletion.enableLogging)
    console.log('AutoCompletion - ' + level + ' - ' + message);
}

var logObj = function (obj) {
  if (AutoCompletion.enableLogging)
    console.dir(obj);
}

/**
 * Initialize element with jQueryUI autocomplete
 * @param element
 */
AutoCompletion.init = function (element) {
  $(element).autocomplete({ source: []});
  log('INFO', 'Initalized element(s) identified by ' + element);
}

AutoCompletion.autocomplete = function (config, processor) {
  if (typeof(config) === 'undefined'){
    log('ERROR', 'Missing required config parameter in autocompleter()');
    return
  }

  // Build the query
  initQuery = {};
  initQuery[config['field']] = {
    $regex: ".*" + $(config['element']).val() + ".*",
    $options: 'i'};
  if (typeof(config['filter']) === 'undefined')
    query = initQuery;
  else
    query = mergeObjects(initQuery, config['filter']);
  log('DEBUG', 'Query object: ');
  logObj(query);

  // Build filtering
  filter = {};
  filter['limit'] = config['limit'];
  filter['sort'] = config['sort'];
  filter['fields'] = {};
  filter['fields'][config['field']] = 1; // Only include the searchable
                                         // field in the result
  log('DEBUG', 'Filter object: ');
  logObj(filter);

  // Find all results
  results = config['collection'].find(query, filter).fetch();
  log('DEBUG', 'Results object: ');
  logObj(results);

  // Get the name parameter from the results
  autocompleteResults = []
  for (var i = results.length - 1; i >= 0; i--) {
    autocompleteResults[i] = results[i][config['field']];
  };

  if (processor) {
    autocompleteResults = processor(autocompleteResults);
  }

  // Update the autocomplete result list
  $(config['element']).autocomplete({ source: autocompleteResults });
}

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
var mergeObjects = function (obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}
