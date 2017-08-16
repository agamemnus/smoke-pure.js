// Smoke-pure.js: (c) 2013-2017 Michael Romanovsky, or "Agamemnus" on Github. Released under the MIT license.

void function () {
 var smoke = {}
 
 // Options:
 smoke.ok               = "Ok"          // Text for "Ok" button.
 smoke.cancel           = "Cancel"      // Text for "Cancel" button.
 smoke.point_event      = 'click'       // Point event ("click", "touchstart", etc.)
 smoke.parent           = document.body // Where the smoke div attaches. Note that if this is undefined (because document.body hasn't been added yet), the build function attempts to define it as document.body when the build function is run --that is, when the smoke DOM object is created.
 smoke.zindex           = 10000         // Z-index of the smoke DOM object. This should be a high number.
 smoke.reverse_buttons  = false         // If false, the "Ok" button appears before (left of) the "Cancel" button. If true, the "Cancel" button appears before the "Ok" button.
 smoke.autofocus        = true          // If true, the input is automatically focused when the smoke DOM object is created.
 smoke.autoexit         = true          // If true, clicking outside the smoke dialog (but inside the dialog_wrapper) detaches the smoke DOM object, cleans up event listeners, and runs the callback with a parameter of (false, evt).
 smoke.autoclose        = true          // If true, clicking any regular button that would normally close a dialog (.e.g.: "ok", "cancel") actually closes the dialog (detaches it / cleans up listeners). Otherwise, "dialog.close()" must be run manually.
 smoke.custom_css       = {}            // Custom classes for each object in the structure. E.G.: smoke.custom_css = {"button.ok": "my_ok_button_style"} or smoke.custom_css = {"buttons.ok": ["my_ok_button_style1", "my_ok_button_style2"]}
 smoke.css_prefix       = "smoke"       // The CSS prefix for the classes used in the .build function.
 smoke.value            = undefined     // The initial value to set the prompt input text to.
 smoke.callback         = undefined     // Function to run after user input is sent.
 smoke.observe_mutation = true          // If true, attachess a mutation observer that will destroy the keyboard listeners when the element is removed from the DOM.
 smoke.window_opened    = undefined     // Function that runs at the end of smoke.build. Is in the form of "function (dom_window_object, text, processed_params)".
 smoke.window_closed    = undefined     // Function that runs after the object is removed from the DOM. Is in the form of "function (dom_window_object, text, processed_params)". Requires observe_mutation to be true for full functionality.
 
 smoke.title = {}
 smoke.title.text         = undefined // Extra title text, typically placed on the top of a dialog.
 smoke.title.close_button = undefined // Close button, typically placed on the top-left of a dialog.
                                      // The close button automatically has the same functionality as the cancel button.
 
 // Structure:
 // var obj (return value)       | smoke-base
 //  obj.dialog_wrapper          |  smoke-dialog_wrapper
 //   obj.dialog                 |   smoke-dialog
 //   obj.dialog.text            |    smoke-dialog-text
 //   obj.dialog.prompt          |    smoke-dialog-prompt
 //   obj.dialog.prompt.input    |     smoke-dialog-prompt-input
 //   obj.dialog.buttons         |    smoke-dialog-buttons
 //   obj.dialog.buttons.ok      |     smoke-dialog-buttons-ok
 //   obj.dialog.buttons.cancel  |     smoke-dialog-buttons-cancel
 //
 // Extras:
 // obj.dialog.ok     () // <-- programatically run "ok" on the object.
 // obj.dialog.cancel () // <-- programatically run "cancel" on the object.
 
 smoke.build = function (text, params) {
  if ((typeof smoke.parent == "undefined") || (smoke.parent == null)) smoke.parent = document.body
  var ok                  = (typeof params.ok               != "undefined") ? params.ok               : smoke.ok
  var ok_reference        = (typeof params.ok_reference     != "undefined") ? params.ok_reference     : smoke.ok_reference
  var cancel              = (typeof params.cancel           != "undefined") ? params.cancel           : smoke.cancel
  var point_event         = (typeof params.point_event      != "undefined") ? params.point_event      : smoke.point_event
  var parent              = (typeof params.parent           != "undefined") ? params.parent           : smoke.parent
  var zindex              = (typeof params.zindex           != "undefined") ? params.zindex           : smoke.zindex
  var reverse_buttons     = (typeof params.reverse_buttons  != "undefined") ? params.reverse_buttons  : smoke.reverse_buttons
  var autoexit            = (typeof params.autoexit         != "undefined") ? params.autoexit         : smoke.autoexit
  var autofocus           = (typeof params.autofocus        != "undefined") ? params.autofocus        : smoke.autofocus
  var autoclose           = (typeof params.autoclose        != "undefined") ? params.autoclose        : smoke.autoclose
  var custom_css          = (typeof params.custom_css       != "undefined") ? params.custom_css       : smoke.custom_css
  var css_prefix          = (typeof params.css_prefix       != "undefined") ? params.css_prefix       : smoke.css_prefix
  var input_default_value = (typeof params.value            != "undefined") ? params.value            : smoke.value
  var callback            = (typeof params.callback         != "undefined") ? params.callback         : smoke.callback
  var observe_mutation    = (typeof params.observe_mutation != "undefined") ? params.observe_mutation : smoke.observe_mutation
  var title               = (typeof params.title            != "undefined") ? merge_objects(smoke.title, params.title) : smoke.title
  var window_opened       = (typeof params.window_opened    != "undefined") ? params.window_opened    : smoke.window_opened
  var window_closed       = (typeof params.window_closed    != "undefined") ? params.window_closed    : smoke.window_closed
  var window_closed_ran   = false
  params.point_event      = point_event
  params.callback         = callback
  params.autoclose        = autoclose
  
  var obj = document.createElement('div'); obj.className = css_prefix + '-base'; obj.style.zIndex = zindex
  obj.savedScrollTop = parent.scrollTop
  parent.appendChild (obj)
  
  var dialog_wrapper = obj.dialog_wrapper = document.createElement ('div'); dialog_wrapper.className = css_prefix + '-dialog_wrapper'
  obj.appendChild (dialog_wrapper)
  
  // Add an event listener for when the user clicks outside of the dialog, but inside the dialog wrapper.
  // If activated, the parent smoke div removes itself and calls the callback.
  if (autoexit) {
   dialog_wrapper.addEventListener (point_event, function (evt) {
    if (typeof evt.changedTouches != "undefined") evt = evt.changedTouches[0]
    if (evt.currentTarget != evt.target) return
    obj.dialog.close ()
    params.callback (false, evt)
    if ((!window_closed_ran) && smoke.window_closed) {smoke.window_closed (obj, text, params); window_closed_ran = true}
   })
  }
  
  // Create the dialog element.
  var dialog = obj.dialog = document.createElement ('div'); dialog.className = css_prefix + '-dialog'
  dialog_wrapper.appendChild (dialog)
  
  // Create the buttons div.
  var buttons = dialog.buttons = document.createElement ('div'); buttons.className = css_prefix + '-dialog-buttons'
  
  // Add a title to the modal.
  if ((typeof title.text != "undefined") || (typeof title.close_button != "undefined")) {
   var title_element = dialog.title = document.createElement ('div'); title_element.className = css_prefix + '-dialog-title'
   if (typeof title.close_button != "undefined") {
    var title_close = buttons.title_close = title.close_button.cloneNode(true)
    title_close.classList.add (css_prefix + '-dialog-title-cancel')
    title_element.appendChild (title_close)
   }
   if (typeof title.text != "undefined") {
    var title_fragment = document.createDocumentFragment(); title_fragment.textContent = title.text
    title_element.appendChild (title_fragment)
   }
   dialog.appendChild (title_element)
  }
  
  // Add text to the modal.
  var text_div = dialog.text = document.createElement ('div'); text_div.className = css_prefix + '-dialog-text'
  text_div.innerHTML = text
  dialog.appendChild (text_div)
  
  // Add a prompt to the modal.
  if (params.type == 'prompt') {
   var prompt = obj.dialog.prompt = document.createElement ('div'); prompt.className = css_prefix + '-prompt'
   prompt.input = document.createElement ('input'); prompt.input.type = 'text';  prompt.input.className = css_prefix + '-prompt-input'
   if (typeof input_default_value != "undefined") prompt.input.value = input_default_value
   prompt.appendChild (prompt.input)
   dialog.appendChild (prompt)
  }
  
  // Add an OK button to the modal.
  if (typeof ok_reference != "undefined") {
   buttons.ok = ok_reference.cloneNode (true)
  } else {
   buttons.ok = document.createElement ('button'); buttons.ok.classList.add (css_prefix + '-dialog-buttons-ok'); buttons.ok.innerHTML = ok
  }
  
  // Add "ok" and "cancel" buttons to the modal.
  if (params.type == 'alert') buttons.appendChild (buttons.ok)
  if ((params.type == 'prompt') || (params.type == 'confirm')) {
   buttons.cancel = document.createElement ('button'); buttons.cancel.className = css_prefix + '-dialog-buttons-cancel'; buttons.cancel.innerHTML = cancel
   if (params.reverse_buttons) {
    buttons.appendChild (buttons.cancel); buttons.appendChild (buttons.ok)
   } else {
    buttons.appendChild (buttons.ok); buttons.appendChild (buttons.cancel)
   }
  }
  dialog.appendChild (buttons)
  
  // Append any extra CSS styles on any part of the structure.
  for (var current_structure_name in custom_css) {
   var property_array = current_structure_name.split (".")
   var current_element = obj
   property_array.forEach (function (current_property) {current_element = current_element[current_property]})
   var current_class_list = custom_css[current_structure_name]
   if (typeof current_class_list == "string") current_class_list = [current_class_list]
   current_class_list.forEach (function (current_classname) {current_element.classList.add (current_classname)})
  }
  
  if (typeof params.callback != "function") params.callback = function () {}
  obj.dialog.params = params
  smoke['finishbuilding_' + params.type] (obj, params)
  if (dialog.buttons.title_close) {
   dialog.buttons.title_close.addEventListener (dialog.params.point_event, dialog.cancel ? dialog.cancel: dialog.ok)
   dialog.buttons.title_close.smoke_pure_obj = obj
  }
  
  if ((typeof obj.dialog.prompt != "undefined") && (autofocus != false)) obj.dialog.prompt.input.focus ()
  
  obj.style.top = obj.savedScrollTop + "px"
  parent.scrollTop = obj.savedScrollTop
  
  // Add a mutation observer that observes for the object's removal. If it is removed, destroy the listeners, reset the scroll top, and run smoke.window_closed.
  if (observe_mutation) {
   var MutationObserver = window.MutationObserver || window.WebkitMutationObserver
   if (typeof MutationObserver != "undefined") {
    var observer = new MutationObserver (function (mutation_list) {
     for (var i = 0, curlen_i = mutation_list.length; i < curlen_i; i++) {
      var mutation_item = mutation_list[i]
      if (mutation_item.type != 'childList') return
      for (var j = 0, curlen_j = mutation_item.removedNodes.length; j < curlen_j; j++) {
       if (mutation_item.removedNodes[j] != obj) continue
       dialog.cleanup (observer)
       if ((!window_closed_ran) && smoke.window_closed) {smoke.window_closed (obj, text, params); window_closed_ran = true}
       return
      }
     }
    })
    observer.observe (parent, {attributes: false, childList: true, subtree: false})
   }
  }
  
  dialog.cleanup = function (observer) {
   if (observer) observer.disconnect ()
   dialog.listener_list.forEach (function (listener) {
    document.removeEventListener (listener.event, listener.callback)
    dialog.listener_list = []
   })
  }
  
  dialog.close = function () {obj.dialog.cleanup (); if (obj.parentNode) obj.parentNode.removeChild (obj)}
  
  if (smoke.window_opened) smoke.window_opened (obj, text, params)
  
  return obj
 }
 
 smoke.finishbuilding_alert   = function (obj) {
  var dialog = obj.dialog
  dialog.callback_ok = function () {dialog.params.callback ()}
  var ok_function_wrapper = dialog.ok = function (evt) {ok_function(evt, obj)}
  smoke.add_global_listener (dialog, 'keyup', ok_function_wrapper)
  dialog.buttons.ok.addEventListener (dialog.params.point_event, ok_function_wrapper)
  dialog.buttons.ok.smoke_pure_obj = obj
 }
 
 smoke.finishbuilding_confirm = function (obj) {
  var dialog = obj.dialog
  dialog.callback_ok     = function () {dialog.params.callback (true)}
  dialog.callback_cancel = function () {dialog.params.callback (false)}
  var ok_function_wrapper     = dialog.ok     = function (evt) {ok_function    (evt, obj)}
  var cancel_function_wrapper = dialog.cancel = function (evt) {cancel_function(evt, obj)}
  smoke.add_global_listener (dialog, 'keyup', ok_function_wrapper)
  smoke.add_global_listener (dialog, 'keyup', cancel_function_wrapper)
  dialog.buttons.ok.addEventListener     (dialog.params.point_event, ok_function_wrapper)
  dialog.buttons.cancel.addEventListener (dialog.params.point_event, cancel_function_wrapper)
  dialog.buttons.ok.smoke_pure_obj     = obj
  dialog.buttons.cancel.smoke_pure_obj = obj
 }
 smoke.finishbuilding_prompt  = function (obj) {
  var dialog = obj.dialog
  dialog.callback_ok     = function () {dialog.params.callback (dialog.prompt.input.value)}
  dialog.callback_cancel = function () {dialog.params.callback (false)}
  var ok_function_wrapper     = dialog.ok     = function (evt) {ok_function    (evt, obj)}
  var cancel_function_wrapper = dialog.cancel = function (evt) {cancel_function(evt, obj)}
  smoke.add_global_listener (dialog, 'keyup', ok_function_wrapper)
  smoke.add_global_listener (dialog, 'keyup', cancel_function_wrapper)
  dialog.buttons.ok.addEventListener     (dialog.params.point_event, ok_function_wrapper)
  dialog.buttons.cancel.addEventListener (dialog.params.point_event, cancel_function_wrapper)
  dialog.buttons.ok.smoke_pure_obj     = obj
  dialog.buttons.cancel.smoke_pure_obj = obj
 }
 
 smoke.add_global_listener = function (dialog, event, callback) {
  document.addEventListener (event, callback)
  if (typeof dialog.listener_list == "undefined") dialog.listener_list = []
  dialog.listener_list.push ({"event": event, "callback": callback})
 }
 
 function ok_function (evt, obj) {
  if (evt && (((evt.type == "keyup") && (typeof evt.keyCode != "undefined")) && ((evt.keyCode == 0) || (evt.keyCode != 13)))) return
  if (obj.dialog.params.autoclose) obj.dialog.close ()
  obj.dialog.callback_ok ()
 }
 function cancel_function (evt, obj) {
  if (evt && (((evt.type == "keyup") && (typeof evt.keyCode != "undefined")) && ((evt.keyCode == 0) || (evt.keyCode != 27)))) return
  if (obj.dialog.params.autoclose) obj.dialog.close ()
  obj.dialog.callback_cancel ()
 }
 
 smoke.action_list = [{name : 'alert'}, {name : 'confirm'}, {name : 'prompt'}]
 
 smoke.action_list.forEach (function (current_action_entry) {
  var current_action = current_action_entry.name
  smoke[current_action] = function (text, callback, params) {return smoke.build (text, merge_objects ({callback: callback, type: current_action}, params))}
 })
 
 function merge_objects (secondary, primary) {
  // The primary object's duplicate keys are superior. The secondary object's duplicate keys are inferior.
  if (typeof secondary == "undefined") var primary = primary.primary, secondary = primary.secondary
  var new_object = {}
  for (var property in secondary) {new_object[property] = secondary[property]}
  for (var property in primary)   {new_object[property] = primary  [property]}
  return new_object
 }
 
 if (typeof module != 'undefined' && module.exports) {
  module.exports = smoke
 } else if (typeof define === 'function' && define.amd) {
  define ('smoke', [], function() {return smoke})
 } else {
  this.smoke = smoke
 }
} ()
