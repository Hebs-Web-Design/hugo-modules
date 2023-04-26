# form.js

This is some reusable data that can be used to submit a form via AplineJS.

## Usage

Use this javascript:

```js
import Alpine from 'alpinejs';
import form from './alpinejs/form';
Alpine.data('form', form);
Alpine.start();
```

Then in a template/partial:

```html
<form
    action="/api/contact"
    method="POST"
    data-sending-text="Sending your message. Please wait..."
    data-sending-class="class-of-sending-text"
    data-sent-text="Your message has been sent. We will be in contact as soon as possible."
    data-sent-class="class-of-sent-text"
    data-error-text="Unfortunately there was a problem sending your message."
    data-error-class="class-of-error-text"
    @submit.prevent="submit"
    x-data="form">
    <label>
        Name
        <input type="text" name="name">
    </label>
    <button type="submit" :disabled="disabled">Submit Form</button>
    <div x-text="status" :class="statusclass" x-cloak>This is where the status is shown</div>
</form>
```
