void function () {
 var smoke = {}
 smoke.point_event = 'click'
 smoke.zindex = 10000
 
 smoke.build = function (text, params) {
  var obj = document.createElement('div'); obj.className = 'smoke-base'; obj.style.zIndex = smoke.zindex
  var ok        = (typeof params.ok        != "undefined") ? (params.ok)        : "OK"
  var cancel    = (typeof params.cancel    != "undefined") ? (params.cancel)    : "Cancel"
  var className = (typeof params.className != "undefined") ? (params.className) : ""
  var parent    = (typeof params.parent    != "undefined") ? (params.parent)    : smoke.parent || document.body
  
  if (params.type == 'prompt') {
   var prompt = obj.prompt = document.createElement ('div'); prompt.className = 'smoke-prompt'
   prompt.input = document.createElement ('input'); prompt.input.type = 'text'
   if (typeof params.value != "undefined") prompt.input.value = params.value
   prompt.appendChild (prompt.input)
  }
  
  var buttons = obj.buttons = document.createElement ('div'); buttons.className = 'smoke-dialog-buttons'
  buttons.ok = document.createElement ('button'); buttons.ok.className = 'ok'; buttons.ok.innerHTML = ok
  if (params.type == 'alert') buttons.appendChild (buttons.ok)
  if ((params.type == 'prompt') || (params.type == 'confirm')) {
   buttons.cancel = document.createElement ('button'); buttons.cancel.className = 'smoke-dialog-buttons-cancel'; buttons.cancel.innerHTML = cancel
   if (params.reverse_buttons) {
    buttons.appendChild (buttons.cancel); buttons.appendChild (buttons.ok)
   } else {
    buttons.appendChild (buttons.ok); buttons.appendChild (buttons.cancel)
   }
  }
  var dialog = document.createElement ('div'); dialog.className = 'smoke-dialog_wrapper'
  var dialog_inner = document.createElement ('div'); dialog_inner.className = 'smoke-dialog'
  var text_div = document.createElement ('div'); text_div.innerHTML = text
  obj.appendChild (dialog)
  dialog.appendChild (dialog_inner)
  dialog_inner.appendChild (text_div)
  if (typeof prompt != "undefined") dialog_inner.appendChild (prompt)
  dialog_inner.appendChild (buttons)
  
  if  (params.type == 'alert')                                 {obj.addEventListener (smoke.point_event, function (evt) {if (evt.currentTarget != evt.target) return; obj.parentNode.removeChild (obj); params.callback ()     })}
  if ((params.type == 'prompt') || (params.type == 'confirm')) {obj.addEventListener (smoke.point_event, function (evt) {if (evt.currentTarget != evt.target) return; obj.parentNode.removeChild (obj); params.callback (false)})}
  document.smoke_pure_obj = obj
  if (typeof params.callback == "undefined") params.callback = function () {}
  obj.params = params
  smoke['finishbuilding_' + params.type] (obj, params)
  
  parent.appendChild (obj)
  if (typeof obj.prompt != "undefined") obj.prompt.input.focus ()
  return obj
 }
 
 smoke.finishbuilding_alert   = function (obj) {
  obj.callback_ok = function () {
  obj.params.callback ()}
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
  var obj = evt.currentTarget.smoke_pure_obj
  if (((typeof evt.keyCode != "undefined") && (evt.keyCode != 0)) && (evt.keyCode != 13)) return
  obj.destroy_listeners ()
  obj.parentNode.removeChild (obj)
  obj.callback_ok ()
 }
 function cancel_function (evt) {
  var obj = evt.currentTarget.smoke_pure_obj
  if (((typeof evt.keyCode != "undefined") && (evt.keyCode != 0)) && (evt.keyCode != 27)) return
  obj.destroy_listeners ()
  obj.parentNode.removeChild (obj)
  obj.callback_cancel ()
 }
 
 var action_list = ['alert', 'confirm', 'prompt']
 for (var i = 0; i < action_list.length; i++) {
  void function (current_action) {
   smoke[current_action] = function (text, callback, params) {return smoke.build (text, merge_objects ({callback: callback, type: current_action}, params))}
  } (action_list[i])
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
