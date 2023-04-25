import axios from 'axios';

export default () => ({
    disabled: false,
    status: '',
    statusclass: '',
    async submit(event) {
        const form = event.target;

        // grab messages and classes from data attributes
        const sendingText = form.dataset.sendingText === undefined ? 'Sending...' : form.data.sendingText;
        const sendingClass =  form.dataset.sendingClass === undefined ? 'email-service-sending' : form.dataset.sendingClass;
        const sentText =  form.dataset.sentText === undefined ? 'Message sent. We will be in contact as soon as possible.' : form.dataset.sentText;
        const sentClass = form.dataset.sentClass === undefined ? 'email-service-sent' : form.dataset.sentClass;
        const errorText = form.dataset.errorText === undefined ? 'There was a problem sending your message.' : form.dataset.errorText;
        const errorClass = form.dataset.errorClass === undefined ? 'email-service-error' : form.dataset.errorClass;

        console.log(form);
        this.disabled = true;
        this.status = sendingText;
        this.statusclass = sendingClass;

        // grab formdata
        const data = new FormData(form);
        const action = form.action;

        // do POST of form
        try {
            await axios.post(action, data);

            this.status = sentText;
            this.statusclass = sentClass;
        } catch (error) {
            this.status = errorText;
            this.statusclass = errorClass;

            console.log(error);
        }
    }
});