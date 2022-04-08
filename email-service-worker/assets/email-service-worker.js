import { createVerifier } from "@glenstack/cf-workers-hcaptcha";

const verify = createVerifier(SECRET_KEY);

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        
          if (url.pathname.startsWith('/api/email-service')) {
            if (request.method === "OPTIONS") {
              context.respondWith(handleOptions(request[0]));
            } else {
              context.respondWith(handle(request));
            }
          }
          // Otherwise, serve the static assets.
          // Without this, the Worker will error and no assets will be served.
          return env.ASSETS.fetch(request);
  },
};

// Helper function to return JSON response
const JSONResponse = (message, status = 200) => {
  let headers = {
    headers: {
        "content-type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    },

    status: status
  };

  let response = {
    message: message
  };

  return new Response(JSON.stringify(response), headers);
};

const urlfy = obj =>
  Object.keys(obj)
    .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]))
    .join("&");


function handleOptions(request) {
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS pre-flight request.
    return new Response(null, {
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Client-Key"
    }
    });
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
    headers: {
        Allow: "GET, HEAD, POST, OPTIONS"
    }
    });
  }
}

function authorize(config, request) {
  if (request.headers.get("Client-Key") !== config.client_key) {
    throw new Error('Unauthorized request');
  }
}

// Utility function to validate form fields
function validateInput(config, form) {
  // check all form values exist
  for (let i = 0; i < config.form_fields.length; i++) {
    let field = config.form_fields[i];
    if (!form.has(field)) {
      throw new Error(`Invalid request: Form field "${field}" missing`);
    }
  }
  if (!form.has(config.honeypot_field)) {
    throw new Error(`Invalid request: Honeypot field "${field}" missing`);
  }

  // check honeypot field was empty
  if (form.get(config.honeypot_field) !== "") {
    throw new Error(`Invalid request: Honeypot field "${field}" not empty`);
  }

  // Validate form inputs
  for (let i = 0; i < config.form_fields.length; i++) {
    let field = config.form_fields[i];
    if (form.get(field) === "") {
      throw new Error(`A required field was not set: ${field}`);
    }
  }

  // Validate email field
  let email_regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  let email = form.get(config.email_field);
  if (email === "" || !email_regex.test(email)) {
    throw new Error("Please, enter valid email address");
  }
}

function generateAdminOptions(config, form) {
  let admin_template = `
    <html>
      <body>
        A new message has been sent via your website.<br><br>
  `;

  // go through fields and print
  for (let i = 0; i < config.form_fields.length; i++) {
    let field = config.form_fields[i];

    // skip message here
    if (field == 'message') {
      continue;
    }

    admin_template = admin_template + `
          <b>${field.charAt(0).toUpperCase() + field.slice(1)}</b>: ${form.get(field)} <br>
    `;

  }

  admin_template = admin_template + `
        <br>
        <b>Message:</b><br>
        ${form.get("message").replace(/(?:\r\n|\r|\n)/g, "<br>")}
      </body>
    </html>
  `;

  let admin_data = {
    from: `${config.org} <${config.from}>`,
    to: config.admin_email,
    subject: `${config.org}: New message from ${form.get("name")}`,
    html: admin_template,
    "h:Reply-To": form.get("email") // reply to user
  };

  let admin_options = {
    method: "POST",
    headers: {
        Authorization: "Basic " + btoa("api:" + config.mailgun_key),
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": admin_data.length
    },
    body: urlfy(admin_data)
  };
  return admin_options;
}

function generateUserOptions(config, form) {
  const user_template = `
    <html>
        <body>
            Hello ${form.get("name")}, <br>
            <br>
            Thank you for reaching out! <br>
            <br>
            Your message has been received by ${config.org} and we will be in contact as soon as possible. <br>
            <br>
            Thank you, <br>
            ${config.org}
        </body>
    </html>
  `;

  let user_data = {
    from: `${config.org} <${config.from}>`,
    to: `${form.get("name")} <${form.get("email")}>`,
    subject: `Thank you for contacting ${config.org}!`,
    html: user_template,
    "h:Reply-To": config.admin_email, // reply to admin
  };

  let user_options = {
    method: "POST",
    headers: {
        Authorization: "Basic " + btoa("api:" + config.mailgun_key),
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": user_data.length
    },
    body: urlfy(user_data)
  };
  return user_options;
}

async function handle(request) {
  //grab config from KV
  const config = await KV.get("emailServiceConfig", {type: "json"}); 

  // Authenticate pre-distributed API key
  try {
    authorize(config, request);
  } catch (err) {
    console.log(`Client key error: ${err.message}`);
    return JSONResponse("Unauthorized request", 401);
  }

  // Validate form fields
  let form;
  try {
    form = await request.clone().formData();
  } catch (err) {
    console.log(`Form error: ${err.message}`);
    return JSONResponse(err.message, 400);
  }

  try {
    validateInput(config, form);
  } catch (err)  {
    console.log(`Field validation error: ${err.message}`);
    return JSONResponse(err.message, 400);
  }

  // verify captcha
  try {
    const payload = await verify(request);
  } catch (err) {
    console.log(`CAPTCHA error: ${err.message}`);
    return JSONResponse(err.message, 400);
  }

  // Construct admin and user email and options
  try { 
    const admin_options = generateAdminOptions(config, form);
    const user_options = generateUserOptions(config, form);

    // Config to submit each email
    const options = [admin_options, user_options];

    // Send admin and user emails
    try {
        await Promise.all(options.map(opt =>
            fetch(`https://api.mailgun.net/v3/${config.mailgun_domain}/messages`, opt)
            .then(response => {
                if (response.status != 200) {
                    throw new Error("Email failed to send");
                }
            })
            .catch(err => {
                throw new Error("Email failed to send");
            })
        ));
    } catch (err) {
        console.log(`Failed to send email: ${err}`);
        return JSONResponse("Failed to send email, please contact website administrator", 500);
    }
  } catch (err) {
    console.log(`Failed to generate email: ${err}`);
    return JSONResponse("Failed to generate email, please contact website administrator", 500);
  }

  return JSONResponse("Message has been sent");
}