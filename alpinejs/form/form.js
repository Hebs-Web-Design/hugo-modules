export default () => ({
    submitted: false,
    sending: false,
    status: '',
    statusclass: '',
    async submit(event) {
        const form = event.target;

        // grab messages and classes from data attributes
        const sendingText = form.dataset.sendingText === undefined ? '' : form.dataset.sendingText;
        const sendingClass = form.dataset.sendingClass === undefined ? '' : form.dataset.sendingClass;
        const sentText = form.dataset.sentText === undefined ? '' : form.dataset.sentText;
        const sentClass = form.dataset.sentClass === undefined ? '' : form.dataset.sentClass;
        const errorText = form.dataset.errorText === undefined ? '' : form.dataset.errorText;
        const errorClass = form.dataset.errorClass === undefined ? '' : form.dataset.errorClass;

        // status updates
        this.submitted = true;
        this.sending = true;
        this.status = sendingText;
        this.statusclass = sendingClass;

        // grab formdata
        const data = new FormData(form);
        const url = form.action;

        // do POST of form
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: data
            });

            // check response was ok
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }

            this.status = sentText;
            this.statusclass = sentClass;
        } catch (error) {
            this.status = errorText;
            this.statusclass = errorClass;

            console.log(error);
        }

        this.sending = false;
    }
});