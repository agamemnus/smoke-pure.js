smoke-pure.js
===============

Inspired by https://github.com/hxgf/smoke.js. I wanted to get rid of the DOM ID reliance that smoke.js had. This also fixes a bug where the actual base elements are never deleted after use, only hidden.

I removed some features. Might add them in later in a different way. Features removed (possibly not an exhaustive list):
* No "quiz" or "signal" items. Just alert, prompt, and confirm.
* No IE8 compatibility -- gives more of a reason to force people to upgrade.
* reverseButtons was changed to reverse_buttons... is reversebuttons better? I'm not sure.

The CSS is the same, and copied here for convenience as smoke-old.css.
