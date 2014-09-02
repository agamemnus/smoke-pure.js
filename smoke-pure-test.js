// Smoke-pure.js: (c) 2013-2014 Michael Romanovsky, or "Agamemnus" on Github. Released under the MIT license.

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
 smoke.autoexit         = true          // If true, clicking outside the smoke dialog (but inside the dialog_wrapper) closes/detaches the smoke DOM object and runs the callback with a parameter of (false, evt).
 smoke.custom_css       = {}            // Custom classes for each object in the structure. E.G.: smoke.custom_css = {"button.ok": "my_ok_button_style"} or smoke.custom_css = {"buttons.ok": ["my_ok_button_style1", "my_ok_button_style2"]}
 smoke.css_prefix       = "smoke"       // The CSS prefix for the classes used in the .build function.
 smoke.value            = undefined     // The initial value to set the prompt input text to.
 smoke.callback         = undefined     // Function to run after user input is sent.
 smoke.observe_mutation = true          // If true, attachess a mutation observer that will destroy the keyboard listeners when the element is removed from the DOM.
 
 // Structure:
 // var obj (return value)                              | smoke-base
 //  obj.dialog_wrapper                                 |  smoke-dialog_wrapper
 //   obj.dialog                                        |   smoke-dialog
 //    obj.text            = obj.dialog.text            |    smoke-dialog-text
 //    obj.prompt          = obj.dialog.prompt          |    smoke-dialog-prompt
 //     obj.prompt.input   = obj.dialog.prompt.input    |     smoke-dialog-prompt-input
 //    obj.buttons         = obj.dialog.buttons         |    smoke-dialog-buttons
 //     obj.buttons.ok     = obj.dialog.buttons.ok      |     smoke-dialog-buttons-ok
 //     obj.buttons.cancel = obj.dialog.buttons.cancel  |     smoke-dialog-buttons-cancel
 
 smoke.build = function (text, params) {
  if ((typeof smoke.parent == "undefined") || (smoke.parent == null)) smoke.parent = document.body
  var ok                  = (typeof params.ok               != "undefined") ? params.ok               : smoke.ok
  var cancel              = (typeof params.cancel           != "undefined") ? params.cancel           : smoke.cancel
  var point_event         = (typeof params.point_event      != "undefined") ? params.point_event      : smoke.point_event
  var parent              = (typeof params.parent           != "undefined") ? params.parent           : smoke.parent
  var zindex              = (typeof params.zindex           != "undefined") ? params.zindex           : smoke.zindex
  var reverse_buttons     = (typeof params.reverse_buttons  != "undefined") ? params.reverse_buttons  : smoke.reverse_buttons
  var autoexit            = (typeof params.autoexit         != "undefined") ? params.autoexit         : smoke.autoexit
  var autofocus           = (typeof params.autofocus        != "undefined") ? params.autofocus        : smoke.autofocus
  var custom_css          = (typeof params.custom_css       != "undefined") ? params.custom_css       : smoke.custom_css
  var css_prefix          = (typeof params.css_prefix       != "undefined") ? params.css_prefix       : smoke.css_prefix
  var input_default_value = (typeof params.value            != "undefined") ? params.value            : smoke.value
  var callback            = (typeof params.callback         != "undefined") ? params.callback         : smoke.callback
  var observe_mutation    = (typeof params.observe_mutation != "undefined") ? params.observe_mutation : smoke.observe_mutation
  params.point_event      = point_event
  params.callback         = callback
  
  var obj = document.createElement('div'); obj.className = css_prefix + '-base'; obj.style.zIndex = zindex
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
  
  var text_div = obj.text = obj.dialog.text = document.createElement ('div'); text_div.className = css_prefix + '-dialog-text'
  text_div.innerHTML = text
  dialog.appendChild (text_div)
  
  if (params.type == 'prompt') {
   var prompt = obj.prompt = obj.dialog.prompt = document.createElement ('div'); prompt.className = css_prefix + '-prompt'
   prompt.input = document.createElement ('input'); prompt.input.type = 'text';  prompt.input.className = css_prefix + '-prompt-input'
   if (typeof input_default_value != "undefined") prompt.input.value = input_default_value
   prompt.appendChild (prompt.input)
   dialog.appendChild (prompt)
  }
  
  var buttons = obj.buttons = obj.dialog.buttons = document.createElement ('div'); buttons.className = css_prefix + '-dialog-buttons'
  buttons.ok = document.createElement ('button'); buttons.ok.className = css_prefix + '-dialog-buttons-ok'; buttons.ok.innerHTML = ok
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
  obj.params = params
  smoke['finishbuilding_' + params.type] (obj, params)
  if ((typeof obj.prompt != "undefined") && (autofocus != false)) obj.prompt.input.focus ()
  
  // Add a mutation observer for listener destruction.
  if (observe_mutation) {
   var MutationObserver = window.MutationObserver || window.WebkitMutationObserver
   if (typeof MutationObserver != "undefined") {
    var observer = new MutationObserver (function (mutation_list) {
     for (var i = 0, curlen_i = mutation_list.length; i < curlen_i; i++) {
      var mutation_item = mutation_list[i]
      if (mutation_item.type != 'childList') return
      console.log (mutation_item.type)
      for (var j = 0, curlen_j = mutation_item.removedNodes.length; j < curlen_j; j++) {
       if (mutation_item.removedNodes[j] != obj) continue
       obj.destroy_listeners (observer); return
      }
     }
    })
    observer.observe (parent, {attributes: false, childList: true, subtree: false})
   }
  }
  
  return obj
 }
 
 smoke.finishbuilding_alert   = function (obj) {
  obj.callback_ok = function () {obj.params.callback ()}
  obj.destroy_listeners = function (observer) {if (observer) observer.disconnect (); document.removeEventListener ('keyup', ok_function_wrapper)}
  var ok_function_wrapper = function (evt) {ok_function(evt, obj)}
  document.addEventListener       ('keyup', ok_function_wrapper)
  obj.buttons.ok.addEventListener (obj.params.point_event, ok_function_wrapper)
  obj.buttons.ok.smoke_pure_obj = obj
 }
 smoke.finishbuilding_confirm = function (obj) {
  obj.callback_ok     = function () {obj.params.callback (true)}
  obj.callback_cancel = function () {obj.params.callback (false)}
  obj.destroy_listeners = function (observer) {
   if (observer) observer.disconnect ()
   document.removeEventListener ('keyup', ok_function_wrapper)
   document.removeEventListener ('keyup', cancel_function_wrapper)
  }
  var ok_function_wrapper     = function (evt) {ok_function    (evt, obj)}
  var cancel_function_wrapper = function (evt) {cancel_function(evt, obj)}
  document.addEventListener           ('keyup', ok_function_wrapper)
  obj.buttons.ok.addEventListener     (obj.params.point_event, ok_function_wrapper)
  document.addEventListener           ('keyup', cancel_function_wrapper)
  obj.buttons.cancel.addEventListener (obj.params.point_event, cancel_function_wrapper)
  obj.buttons.ok.smoke_pure_obj     = obj
  obj.buttons.cancel.smoke_pure_obj = obj
 }
 smoke.finishbuilding_prompt  = function (obj) {
  obj.callback_ok     = function () {obj.params.callback (obj.prompt.input.value)}
  obj.callback_cancel = function () {obj.params.callback (false)}
  obj.destroy_listeners = function (observer) {
   if (observer) observer.disconnect ()
   document.removeEventListener ('keyup', function ok_function_wrapper)
   document.removeEventListener ('keyup', cancel_function_wrapper)
  }
  var ok_function_wrapper     = function (evt) {ok_function    (evt, obj)}
  var cancel_function_wrapper = function (evt) {cancel_function(evt, obj)}
  document.addEventListener           ('keyup', ok_function_wrapper)
  obj.buttons.ok.addEventListener     (obj.params.point_event, ok_function_wrapper
  document.addEventListener           ('keyup', cancel_function_wrapper)
  obj.buttons.cancel.addEventListener (obj.params.point_event, cancel_function_wrapper)
  obj.buttons.ok.smoke_pure_obj     = obj
  obj.buttons.cancel.smoke_pure_obj = obj
 }
 
 function ok_function (evt, obj) {
  if (((evt.type == "keyup") && (typeof evt.keyCode != "undefined")) && ((evt.keyCode == 0) || (evt.keyCode != 13))) return
  obj.destroy_listeners ()
  obj.parentNode.removeChild (obj)
  obj.callback_ok ()
 }
 function cancel_function (evt, obj) {
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
