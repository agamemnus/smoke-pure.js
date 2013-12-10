smoke-pure.js
===============

Inspired by https://github.com/hxgf/smoke.js. I wanted to get rid of the DOM ID reliance that smoke.js had. This also fixes a bug where the actual base elements are never deleted, only hidden.

I removed some features. Might add them in later in a different way. Features removed (possibly not an exhaustive list):
* No "quiz" or "signal" items. Just alert, prompt, and confirm.
* No IE8 compatibility -- give of a reason to force people to upgrade.
* Keyboard controls are entirely gone... not sure about overwriting things via obj.onkeyevent. Ideally mutation observers should be used, but that is only supported in IE11+...
* reverseButtons was changed to reverse_buttons... is reversebuttons better? I'm not sure.

The CSS is the same, and copied here for convenience. I only claim the JS file as my own.
