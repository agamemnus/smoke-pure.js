void function () {
 var smoke = {}
 
 // Self-explanatory:
 smoke.point_event = 'click'
 smoke.zindex      = 10000
 smoke.autofocus   = true
 smoke.autoexit    = true
 smoke.css_prefix  = "smoke"
 
 // Structure:
 // return value        = document.smoke_pure_obj | smoke-base
 //  .dialog_wrapper                              |  smoke-dialog_wrapper
 //   .dialog                                     |   smoke-dialog
 //    .text            = .dialog.text            |    smoke-dialog-text
 //    .prompt          = .dialog.prompt          |    smoke-dialog-prompt
 //     .prompt.input   = .dialog.prompt.input    |     smoke-dialog-prompt-input
 //    .buttons         = .dialog.buttons         |    smoke-dialog-buttons
 //     .buttons.ok     = .dialog.buttons.ok      |     smoke-dialog-buttons-ok
 //     .buttons.cancel = .dialog.buttons.cancel  |     smoke-dialog-buttons-cancel
 
 smoke.build = function (text, params) {
  var css_prefix = smoke.css_prefix
  var ok         = (typeof params.ok        != "undefined") ? (params.ok)        : "Ok"
  var cancel     = (typeof params.cancel    != "undefined") ? (params.cancel)    : "Cancel"
  var className  = (typeof params.className != "undefined") ? (params.className) : ""
  var parent     = smoke.parent   || params.parent   || document.body
  var autoexit   = smoke.autoexit || params.autoexit || true
  
  var obj = document.smoke_pure_obj = document.createElement('div'); obj.className = css_prefix + '-base'; obj.style.zIndex = smoke.zindex
  parent.appendChild (obj)
  
  var dialog_wrapper = obj.dialog_wrapper = document.createElement ('div'); dialog_wrapper.className = css_prefix + '-dialog_wrapper'
  obj.appendChild (dialog_wrapper)
  
  // Add an event listener for when the user clicks outside of the dialog, but inside the dialog wrapper.
  // If activated, the parent smoke div removes itself and calls the callback.
  if (autoexit) {
   dialog_wrapper.addEventListener (smoke.point_event, function (evt) {
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
  if ((typeof obj.prompt != "undefined") && (smoke.autofocus != false)) obj.prompt.input.focus ()
  return obj
 }
 
 smoke.finishbuilding_alert   = function (obj) {
  obj.callback_ok = function () {obj.params.callback ()}
  obj.destroy_listeners = function () {delete (document.smoke_pure_obj); document.removeEventListener ('keyup', ok_function)}
  document.addEventListener       ('keyup', ok_function)
  obj.buttons.ok.addEventListener (smoke.point_event, ok_function)
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
  obj.buttons.ok.addEventListener     (smoke.point_event, ok_function)
  document.addEventListener           ('keyup', cancel_function)
  obj.buttons.cancel.addEventListener (smoke.point_event, cancel_function)
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
  obj.buttons.ok.addEventListener     (smoke.point_event, ok_function)
  document.addEventListener           ('keyup', cancel_function)
  obj.buttons.cancel.addEventListener (smoke.point_event, cancel_function)
  obj.buttons.ok.smoke_pure_obj     = obj
  obj.buttons.cancel.smoke_pure_obj = obj
 }
 
 function ok_function (evt) {
  //if (typeof evt.changedTouches != "undefined") evt = evt.changedTouches[0]
  var obj = evt.currentTarget.smoke_pure_obj
  if (((evt.type == "keyup") && (typeof evt.keyCode != "undefined")) && ((evt.keyCode == 0) || (evt.keyCode != 13))) return
  obj.destroy_listeners ()
  obj.parentNode.removeChild (obj)
  obj.callback_ok ()
 }
 function cancel_function (evt) {
  //if (typeof evt.changedTouches != "undefined") evt = evt.changedTouches[0]
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
 
 
function getKeyCodeString (evt) {
 var keyCode = evt.keyCode
 switch (keyCode) {
  case  27 : return "escape"
  case  13 : return "enter"
  default  : return String.fromCharCode(keyCode).toUpperCase()
 } 
}

 if ((typeof define === "function") && (define.amd)) {
  define (smoke)
 } else if (typeof exports === 'object') {
  module.exports = smoke
 } else {
  this.smoke = smoke
 }
} ()
