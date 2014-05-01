// Smoke-pure.js: (c) 2013-2014 Michael Romanovsky, or "Agamemnus" on Github. Released under the MIT license.

void function () {
 var smoke = {}
 
 // Options:
 smoke.ok              = "Ok"          // Text for "Ok" button.
 smoke.cancel          = "Cancel"      // Text for "Cancel" button.
 smoke.point_event     = 'click'       // Point event ("click", "touchstart", etc.)
 smoke.parent          = document.body // Where the smoke div attaches. Note that if this is undefined (because document.body hasn't been added yet), the build function attempts to define it as document.body when the build function is run --that is, when the smoke DOM object is created.
 smoke.zindex          = 10000         // Z-index of the smoke DOM object. This should be a high number.
 smoke.reverse_buttons = false         // If false, the "Ok" button appears before (left of) the "Cancel" button. If true, the "Cancel" button appears before the "Ok" button.
 smoke.autofocus       = true          // If true, the input is automatically focused when the smoke DOM object is created.
 smoke.autoexit        = true          // If true, clicking outside the smoke dialog (but inside the dialog_wrapper) closes/detaches the smoke DOM object and runs the callback with a parameter of (false, evt).
 smoke.css_prefix      = "smoke"       // The CSS prefix for the classes used in the .build function.
 // params.callback                    // Function to run after user input is sent.
 // params.value                       // The initial value to set the prompt input text to.
 
 // Structure:
 // var obj (return value) = document.smoke_pure_obj | smoke-base
 //  obj.dialog_wrapper                              |  smoke-dialog_wrapper
 //   obj.dialog                                     |   smoke-dialog
 //    obj.text            = .dialog.text            |    smoke-dialog-text
 //    obj.prompt          = .dialog.prompt          |    smoke-dialog-prompt
 //     obj.prompt.input   = .dialog.prompt.input    |     smoke-dialog-prompt-input
 //    obj.buttons         = .dialog.buttons         |    smoke-dialog-buttons
 //     obj.buttons.ok     = .dialog.buttons.ok      |     smoke-dialog-buttons-ok
 //     obj.buttons.cancel = .dialog.buttons.cancel  |     smoke-dialog-buttons-cancel
 
 smoke.build = function (text, params) {
  if ((typeof smoke.parent == "undefined") || (smoke.parent == null)) smoke.parent = document.body
  var ok              = (typeof params.ok              != "undefined") ? params.ok              : smoke.ok
  var cancel          = (typeof params.cancel          != "undefined") ? params.cancel          : smoke.cancel
  var point_event     = (typeof params.point_event     != "undefined") ? params.point_event     : smoke.point_event
  var parent          = (typeof params.parent          != "undefined") ? params.parent          : smoke.parent
  var zindex          = (typeof params.zindex          != "undefined") ? params.zindex          : smoke.zindex
  var reverse_buttons = (typeof params.reverse_buttons != "undefined") ? params.reverse_buttons : smoke.reverse_buttons
  var autoexit        = (typeof params.autoexit        != "undefined") ? params.autoexit        : smoke.autoexit
  var autofocus       = (typeof params.autofocus       != "undefined") ? params.autofocus       : smoke.autofocus
  var css_prefix      = (typeof params.css_prefix      != "undefined") ? params.css_prefix      : smoke.css_prefix
  params.point_event = point_event
  
  var obj = document.smoke_pure_obj = document.createElement('div'); obj.className = css_prefix + '-base'; obj.style.zIndex = zindex
  parent.appendChild (obj)
  
  var dialog_wrapper = obj.dialog_wrapper = document.createElement ('div'); dialog_wrapper.className = css_prefix + '-dialog_wrapper'
  obj.appendChild (dialog_wrapper)
  
  // Add an event listener for when the user clicks outside of the dialog, but inside the dialog wrapper.
  // If activated, the parent smoke div removes itself and calls the callback.
  if (autoexit) {
   dialog_wrapper.addEventListener (point_event, function (evt) {
    if (typeof evt.changedTouches != "undefined") evt = evt.changedTouches[0]
    if (evt.currentTarget != evt.target) return
    obj.parentNode.removeChild (obj)
    params.callback (false, evt)
   })
  }
  
  var dialog = obj.dialog = document.createElement ('div'); dialog.className = css_prefix + '-dialog'
  dialog_wrapper.appendChild (dialog)
  
  var text_div = obj.text = document.createElement ('div'); text_div.className = css_prefix + '-dialog-text'
  text_div.innerHTML = text
  dialog.appendChild (text_div)
  
  if (params.type == 'prompt') {
   var prompt = obj.prompt = obj.dialog.prompt = document.createElement ('div'); prompt.className = css_prefix + '-prompt'
   prompt.input = document.createElement ('input'); prompt.input.type = 'text';  prompt.input.className = css_prefix + '-prompt-input'
   if (typeof params.value != "undefined") prompt.input.value = params.value
   prompt.appendChild (prompt.input)
   dialog.appendChild (prompt)
  }
  
  var buttons = obj.buttons = document.createElement ('div'); buttons.className = css_prefix + '-dialog-buttons'
  buttons.ok = document.createElement ('button'); buttons.ok.className = '-dialog-buttons-ok'; buttons.ok.innerHTML = ok
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
  
  if (typeof params.callback != "function") params.callback = function () {}
  obj.params = params
  smoke['finishbuilding_' + params.type] (obj, params)
  if ((typeof obj.prompt != "undefined") && (autofocus != false)) obj.prompt.input.focus ()
  return obj
 }
 
 smoke.finishbuilding_alert   = function (obj) {
  obj.callback_ok = function () {obj.params.callback ()}
  obj.destroy_listeners = function () {delete (document.smoke_pure_obj); document.removeEventListener ('keyup', ok_function)}
  document.addEventListener       ('keyup', ok_function)
  obj.buttons.ok.addEventListener (obj.params.point_event, ok_function)
  obj.buttons.ok.smoke_pure_obj = obj
 }
 smoke.finishbuilding_confirm = function (obj) {
  obj.callback_ok     = function () {obj.params.callback (true)}
  obj.callback_cancel = function () {obj.params.callback (false)}
  obj.destroy_listeners = function () {
   delete (document.smoke_pure_obj)
   document.removeEventListener ('keyup', ok_function)
   document.removeEventListener ('keyup', cancel_function)
  }
  document.addEventListener           ('keyup', ok_function)
  obj.buttons.ok.addEventListener     (obj.params.point_event, ok_function)
  document.addEventListener           ('keyup', cancel_function)
  obj.buttons.cancel.addEventListener (obj.params.point_event, cancel_function)
  obj.buttons.ok.smoke_pure_obj     = obj
  obj.buttons.cancel.smoke_pure_obj = obj
 }
 smoke.finishbuilding_prompt  = function (obj) {
  obj.callback_ok     = function () {obj.params.callback (obj.prompt.input.value)}
  obj.callback_cancel = function () {obj.params.callback (false)}
  obj.destroy_listeners = function () {
   delete (document.smoke_pure_obj)
   document.removeEventListener ('keyup', ok_function)
   document.removeEventListener ('keyup', cancel_function)
  }
  document.addEventListener           ('keyup', ok_function)
  obj.buttons.ok.addEventListener     (obj.params.point_event, ok_function)
  document.addEventListener           ('keyup', cancel_function)
  obj.buttons.cancel.addEventListener (obj.params.point_event, cancel_function)
  obj.buttons.ok.smoke_pure_obj     = obj
  obj.buttons.cancel.smoke_pure_obj = obj
 }
 
 function ok_function (evt) {
  var obj = evt.currentTarget.smoke_pure_obj
  if (((evt.type == "keyup") && (typeof evt.keyCode != "undefined")) && ((evt.keyCode == 0) || (evt.keyCode != 13))) return
  obj.destroy_listeners ()
  obj.parentNode.removeChild (obj)
  obj.callback_ok ()
 }
 function cancel_function (evt) {
  var obj = evt.currentTarget.smoke_pure_obj
  if (((evt.type == "keyup") && (typeof evt.keyCode != "undefined")) && ((evt.keyCode == 0) || (evt.keyCode != 27))) return
  obj.destroy_listeners ()
  obj.parentNode.removeChild (obj)
  obj.callback_cancel ()
 }
 
 smoke.action_list = [{name : 'alert'}, {name : 'confirm'}, {name : 'prompt'}]
 
 for (var i = 0; i < smoke.action_list.length; i++) {
  void function (current_action) {
   smoke[current_action] = function (text, callback, params) {return smoke.build (text, merge_objects ({callback: callback, type: current_action}, params))}
  } (smoke.action_list[i].name)
 }
 
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
