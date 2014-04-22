smoke-pure.js
===============

Inspired by https://github.com/hxgf/smoke.js. I wanted to get rid of the DOM ID reliance that smoke.js had. This also fixes a bug where the actual base elements are never deleted after use, only hidden.

I removed some features. Might add them in later in a different way. Features removed (possibly not an exhaustive list):
* No "quiz" or "signal" items. Just alert, prompt, and confirm.
* No IE8 compatibility -- gives more of a reason to force people to upgrade.
* reverseButtons was changed to reverse_buttons... is reversebuttons better? I'm not sure.

"Less smoke, more health."


How to Use
-----------

var alert_div = smoke.alert ("Hey there!", callback, options)

Live example:

http://agamemnus.github.io/smoke-pure.js/example.htm


````
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
````
