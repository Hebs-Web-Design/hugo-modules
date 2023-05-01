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
    <button type="submit" :disabled="submitted">Submit Form</button>
    <div x-text="status" :class="statusclass" x-cloak>This is where the status is shown</div>
</form>
```

## Configuration

All configuration is via attributes on the target form through the `action` attribute and the various `data` attributes shown above.

* action : The target URL for the form POST
* data-sending-text : The status text while sending
* data-sending-class : Status class while sending
* data-sent-text : The status text when sent
* data-sent-class : Status class when sent
* data-error-text : The status text when an error occurs
* data-error-class : Status class when an error occurs

## Properties

The following properties are provided:

* sending (boolean) : Set to true while the form is being submitted
* status (string) : The current status of the form
* statusclass (string) : The current status class of the form
* submitted (boolean) : If the form has been submitted (successfully or not)
