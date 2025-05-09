const BASE_URL = "http://192.168.3.243:3000";
const nodemailer = require("nodemailer");

async function sendTestEmail(email, businessName) {
  // Create a transporter with your email provider's SMTP details
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "willywario0@gmail.com",
      pass: "qjqd szgi irbe rxzv",
    },
  });

  // Define the HTML content for the welcome email
  const htmlContent1 = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Welcome to ${businessName} inventory</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  background-color: #ffffff;
                  margin: 50px auto;
                  padding: 20px;
                  border-radius: 8px;
                  max-width: 600px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                  text-align: center;
                  padding-bottom: 20px;
              }
              .header h1 {
                  color: #333333;
              }
              .content {
                  font-size: 16px;
                  color: #555555;
                  line-height: 1.6;
              }
              .footer {
                  text-align: center;
                  padding-top: 20px;
                  font-size: 12px;
                  color: #999999;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  margin-top: 20px;
                  background-color: #28a745;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 5px;
              }
              .button:hover {
                  background-color: #218838;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Welcome to ${businessName} inventory</h1>
              </div>
              <div class="content">
                  <p>Hi there,</p>
                  <p>Thank you for joining our community! We're excited to have you on board.</p>
                  <p>Get started by exploring the features and making the most out of our app.</p>
                  <p>Hang tight as we send you your login credentials. Or maybe we already have, check your inbox.</p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} ${businessName} All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
  `;
  // Alternative HTML content for the welcome email
  const htmlContent = `
      <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ${businessName} Inventory</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f2f4f6;
      margin: 0;
      padding: 0;
    }

    .container {
      background-color: #ffffff;
      margin: 40px auto;
      padding: 30px;
      border-radius: 10px;
      max-width: 600px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .header {
      text-align: center;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 15px;
    }

    .header h1 {
      margin: 0;
      font-size: 22px;
      color: #2c3e50;
    }

    .content {
      font-size: 15px;
      color: #555555;
      line-height: 1.7;
      margin-top: 20px;
    }

    .footer {
      text-align: center;
      font-size: 12px;
      color: #aaaaaa;
      margin-top: 30px;
    }

    .button {
      display: inline-block;
      margin-top: 25px;
      padding: 12px 25px;
      background-color: #28a745;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
    }

    .button:hover {
      background-color: #218838;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to ${businessName} Inventory</h1>
    </div>
    <div class="content">
      <p>Hi there,</p>
      <p>Thank you for joining our community! We’re thrilled to have you on board.</p>
      <p>Get started by exploring your dashboard and making the most out of our inventory system.</p>
      <p>If you haven’t received your login credentials yet, please check your inbox or spam folder — they should be on their way!</p>

      <!-- Optional Call-to-Action button -->
      <a href="#" class="button">Go to Dashboard</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>

  `;

  // Define email options
  const mailOptions = {
    from: `${businessName} <willywario0@gmail.com>`, // Sender address
    to: email, // Recipient address
    subject: `Welcome to ${businessName} inventory`, // Subject line
    html: htmlContent, // HTML body
  };

  try {
    // Attempt to send the email
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true; // Email sent successfully
  } catch (error) {
    console.error("Error sending email:", error);
    return false; // Email failed to send
  }
}

const sendEmail = (username, email, userCode, password, businessName) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "willywario0@gmail.com",
      pass: "qjqd szgi irbe rxzv",
    },
  });

  const mailOptions = {
    from: "willywario0@gmail.com",
    to: email,
    subject: "Log In Credentials",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Details</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: auto;
      padding: 20px;
      border: 1px solid #eaeaea;
      border-radius: 8px;
      background-color: #f9f9f9;
    }
    .header {
      text-align: center;
      padding: 10px;
      background-color: #4F46E5;
      color: white;
      border-radius: 8px 8px 0 0;
    }
    .content {
      padding: 20px;
    }
    .details {
      background-color: #ffffff;
      padding: 15px;
      border: 1px solid #dddddd;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #888888;
      padding: 10px;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      font-size: 16px;
      color: white;
      background-color: #4F46E5;
      text-decoration: none;
      border-radius: 4px;
    }
      #a{
        color: white;
        text-decoration: none;
      }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Welcome to ${businessName}</h2>
    </div>
    <div class="content">
      <p>Hello, ${username}</p>
      <p>It's great to have you on the team! Below are your account details:</p>

      <div class="details">
        <p><strong>User Code:</strong> ${userCode}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>

      <p><a href=${BASE_URL} class="btn">Login to Your Account</a></p>
    </div>
    <div class="footer">
      <p>&copy; 2024 ${businessName} | All rights reserved</p>
    </div>
  </div>
</body>
</html>
`,
  };

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Email sent: " + info.response);
    });
  } catch (err) {}
};

const sendPermissionsEmail = (email, permissions) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "willywario0@gmail.com",
      pass: "qjqd szgi irbe rxzv",
    },
  });

  const mailOptions = {
    from: "willywario0@gmail.com",
    to: email,
    subject: "Permissions Update",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Permissions Updated</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: auto;
      padding: 20px;
      border: 1px solid #eaeaea;
      border-radius: 8px;
      background-color: #ffffff;
    }
    .header {
      text-align: center;
      padding: 20px;
      background-color: #4F46E5;
      color: white;
      border-radius: 8px 8px 0 0;
    }
    .content {
      padding: 20px;
    }
    .permissions {
      margin: 20px 0;
    }
    .permission-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #f9f9f9;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    }
    .permission-item .name {
      font-size: 16px;
      font-weight: 500;
    }
    .permission-status {
      display: flex;
      align-items: center;
      font-weight: bold;
      padding: 5px 10px;
      border-radius: 20px;
      color: white;
    }
    .enabled {
      background-color: #4CAF50; /* Green for enabled */
    }
    .disabled {
      background-color: #FF6347; /* Orange-Red for disabled */
    }
    .permission-status svg {
      margin-right: 8px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #888888;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Permissions Update</h2>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We wanted to inform you that your permissions have recently been updated. Here is the list of your current permissions:</p>

      <div class="permissions">

      ${Object.entries(permissions).map(([key, value]) => {
        return `
          <div class="permission-item">
            <span class="name">${key}</span>
            <span class={permission-status ${value ? "enabled" : "disabled"}}>
              <svg width="16" height="16" fill="white" viewBox="0 0 16 16">
                <path d="M13.485 1.757a1 1 0 0 1 1.415 1.414L6.5 11.57l-3.5-3.5a1 1 0 1 1 1.414-1.414L6.5 9.157l6.985-6.986z" />
              </svg>
              ${value ? "Enabled" : "Disabled"}
            </span>
          </div>
        `;
      })}
   
      </div>

      <p>If you have any questions or believe this update was made in error, please contact our support team.</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 Your Company | All rights reserved</p>
    </div>
  </div>
</body>
</html>
  `,
  };

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Email sent: " + info.response);
    });
  } catch (err) {}
};

const sendTransactionReceipt = (
  businessName,
  receiptNumber,
  amount,
  transactionDate
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "willywario0@gmail.com",
      pass: "qjqd szgi irbe rxzv",
    },
  });

  const mailOptions = {
    from: "willywario0@gmail.com",
    to: email,
    subject: "Permissions Update",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt - ${businessName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #eaeaea;
    }
    .header h2 {
      margin: 0;
      color: #2c3e50;
    }
    .content {
      margin-top: 20px;
      font-size: 15px;
      color: #333333;
    }
    .receipt-details {
      margin: 20px 0;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 5px;
      padding: 15px;
    }
    .receipt-details p {
      margin: 8px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #888888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Payment Receipt</h2>
      <p>Thank you for your payment!</p>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>This is a confirmation that we’ve received your payment via M-PESA. Below are the transaction details:</p>

      <div class="receipt-details">
        <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
        <p><strong>Amount Paid:</strong> KES ${amount}</p>
        <p><strong>Transaction Date:</strong> ${transactionDate}</p>
        <p><strong>Business Name:</strong> ${businessName}</p>
      </div>

      <p>If you have any questions or did not authorize this payment, please contact us immediately.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`,
  };

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Email sent: " + info.response);
    });
  } catch (err) {}
};

module.exports = { sendEmail, sendPermissionsEmail, sendTestEmail, sendTransactionReceipt };
