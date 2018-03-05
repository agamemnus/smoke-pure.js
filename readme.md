smoke-pure.js
===============

Inspired by https://github.com/hxgf/smoke.js. I wanted to get rid of the DOM ID reliance that smoke.js had. This also fixes a bug where the actual base elements are never deleted after use, only hidden.

I removed some features. Might add them in later in a different way. Features removed (possibly not an exhaustive list):
* No "quiz" or "signal" items. Just alert, prompt, and confirm.
* No IE8 compatibility -- gives more of a reason to force people to upgrade.
* reverseButtons was changed to reverse_buttons... is reversebuttons better? I'm not sure.

"Less smoke, more health."

Changed 7/22/2017:
-----------
Added the `autoclose` property, which is true by default.
If true, clicking any regular button that would normally close a dialog (.e.g.: "ok", "cancel") actually closes the dialog (detaches it / cleans up listeners). Otherwise, "dialog.close()" must be run manually.
Setting autoclose to `false` can be useful in constructing a more persistent multi-event modal.

Changed 4/23/2017:
-----------
1) The cleanup code, which disconnects observers and removes global key event listeners, is now called "cleanup".

2) The cleanup code is now standardized into one function instead of separate functions per modal type -- to keep track of global key event listeners, they are added to an array called `obj.listener_list`.

3) For long pages (where the heght exceeds the screen height), input boxes no longer jump to the top of the screen when focused, and the modal top position is set to the scrollTop of the modal's parent.

4) Added an `ok_reference` attribute. If specified, this will clone that reference into the "OK" button.

5) Moved the "ok" and "cancel" functions (as well as callback_ok and callback_cancel) from the object to object.dialog.

6) Added a `title` attribute with the properties "text" and "close_button". This creates some HTML (a clone of the close button followed by some text) and inserts it into a newly defined title element inside the dialog.

Changed 12/16/2014:
-----------
1) You can now add a ``smoke_window.window_opened ()`` function and a ``smoke_window.window_closed ()`` callback. These run after a modal window is finished being built (the end of the ``smoke.build`` function) or after a dialog is removed from the DOM.

2) You can now call ``smoke_window.ok ()`` or ``smoke_window.cancel ()`` to programatically run "ok" or "cancel" on a modal window.


Changed 9/02/2014:
-----------
Removed the document.smoke_pure_obj object in favor of wrapping the "cancel" and "ok" functions with the current object.
Added a mutation observer, which will activate the "destroy_listeners" function if the modal is removed from the DOM by some means outside the function. This can be turned off via a new option called "observe_mutation".


Changed 8/10/2014:
-----------
The custom css attribute lets you add classnames to anything in the modal's structure.
````
smoke.custom_css = {"button.ok": "my_ok_button_style"}
// OR
smoke.custom_css = {"buttons.ok": ["my_ok_button_style1", "my_ok_button_style2"]}
````


How to Use
-----------

var alert_div = smoke.alert ("Hey there!", callback, options)

Live example:

http://agamemnus.github.io/smoke-pure.js/example.htm


````
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
 smoke.title.close_button = undefined // Close button, typically placed on the top-right of a dialog.
                                      // The close button has the same functionality as the cancel button, by default.
 
 // Example:
 // var modal = smoke.alert("This is an alert.", callback, options)
 //
 // Property                      | CSS
 // ------------------------------|-------------------------------
 // var modal (return value)      | smoke-base
 //  modal.dialog_wrapper         |  smoke-dialog_wrapper
 //   modal.dialog                |   smoke-dialog
 //   modal.dialog.text           |    smoke-dialog-text
 //   modal.dialog.prompt         |    smoke-dialog-prompt
 //   modal.dialog.prompt.input   |     smoke-dialog-prompt-input
 //   modal.dialog.buttons        |    smoke-dialog-buttons
 //   modal.dialog.buttons.ok     |     smoke-dialog-buttons-ok
 //   modal.dialog.buttons.cancel |     smoke-dialog-buttons-cancel
 //
 // Extras:
 // modal.dialog.ok     () // <-- programatically run "ok" on the object.
 // modal.dialog.cancel () // <-- programatically run "cancel" on the object.
````

Money?
-----------
No problem. I'll take it. https://www.gittip.com/agamemnus/
