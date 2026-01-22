const BASE_URL = "http://192.168.3.243:3000";
const nodemailer = require("nodemailer");
const { v4 } = require("uuid");
const cloudinary = require("cloudinary").v2;
const db = require("monk")(process.env.MONGODB_URL);
const notifications = db.get("notifications");

// Cloudinary Image Bucket Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//format date function
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long", // 'short', 'narrow' for shorter names
    year: "numeric",
    month: "long", // 'short' for abbreviated month names
    day: "numeric",
  });
};

//upload image to cloudinary bucket
const uploadImage = async (image) => {
  const base64String = `data:${image.mimetype};base64,${image.buffer.toString(
    "base64",
  )}`;

  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: "inventory_images",
    });
    return result.url;
  } catch (err) {
    return null;
  }
};

//get plan name using Id
const getPlanName = (planId) => {
  const plans = {
    pl_001: "Basic",
    pl_000: "Free",
    pl_002: "Pro",
    pl_003: "Enterprise",
  };

  return plans[planId] || "Unknown Plan";
};

//websocket emit notification
const emitNotification = (newNotification, req, userId) => {
  console.log("emmitted", userId);
  const io = req.app.get("io");
  const connectedUsers = req.app.get("connectedUsers");

  const socketId = connectedUsers.get(userId);
  console.log("socketId", socketId);
  if (socketId) {
    console.log("emitting to ", userId);
    io.to(socketId).emit("new_notification", newNotification);
  }
};

//send notification
const sendNotification = (details, req) => {
  const notificationDetails = {
    id: v4(),
    title: details?.title,
    message: details?.message,
    type: details?.type, //["info", "warning", "system"]
    to: details?.to,
    from: details?.from,
    createdAt: new Date(),
    seenAt: details?.seenAt,
    priority: details?.priority,
  };

  try {
    notifications
      .insert({
        ...notificationDetails,
      })
      .then((doc) => {
        emitNotification(notificationDetails, req, notificationDetails?.to);
        console.log(doc);
      });
  } catch (err) {
    console.log(err.message);
  }
};

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

const getPermissionsString = (key) => {
  if (key === "canEditInventory") return "Manage Inventory";
  if (key === "canEditEmployees") return "Manage Employees";
  if (key === "canManageAssignItems") return "Manage Assignments";

  return key;
};

const sendPermissionsEmail = (email, permissions, disabled) => {
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
    html:`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Permissions Updated</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#4F46E5;padding:20px;text-align:center;color:#ffffff;">
              <h2 style="margin:0;font-size:22px;">Permissions Update</h2>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:20px;color:#333333;">
              <p style="margin-top:0;">Hello,</p>
              <p>Your account permissions were recently updated. Below is your current access status:</p>

              <!-- Permissions List -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                ${Object.entries(permissions)
                  .map(([key, value]) => `
                    <tr>
                      <td style="padding:12px;border-bottom:1px solid #eeeeee;">
                        <strong>${getPermissionsString(key)}</strong>
                      </td>
                      <td align="right" style="padding:12px;border-bottom:1px solid #eeeeee;">
                        <span style="
                          padding:6px 14px;
                          border-radius:20px;
                          font-size:13px;
                          color:#ffffff;
                          background:${value ? "#22c55e" : "#ef4444"};
                        ">
                          ${value ? "Enabled" : "Disabled"}
                        </span>
                      </td>
                    </tr>
                  `)
                  .join("")}

                <!-- Account Status -->
                <tr>
                  <td style="padding:12px;">
                    <strong>Account Status</strong>
                  </td>
                  <td align="right" style="padding:12px;">
                    <span style="
                      padding:6px 14px;
                      border-radius:20px;
                      font-size:13px;
                      color:#ffffff;
                      background:${disabled ? "#ef4444" : "#22c55e"};
                    ">
                      ${disabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin-top:20px;">
                If you believe this change was made in error, please contact support.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;text-align:center;padding:15px;font-size:12px;color:#888888;">
              © 2024 Your Company. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
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
  email,
  receiptNumber,
  amount,
  transactionDate,
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
    subject: "Transaction Receipt",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt - ${businessName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #eef6f1;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 6px 20px rgba(0, 128, 0, 0.1);
      border-top: 6px solid #34b233;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #d9f1df;
    }
    .header h2 {
      margin: 10px 0;
      color: #34b233;
      font-size: 26px;
    }
    .header p {
      color: #555;
      font-size: 14px;
    }
    .content {
      margin-top: 20px;
      font-size: 15px;
      color: #333;
    }
    .content p {
      margin: 10px 0;
    }
    .receipt-details {
      margin: 20px 0;
      background-color: #f0f9f4;
      border-left: 4px solid #34b233;
      padding: 20px;
      border-radius: 6px;
    }
    .receipt-details p {
      margin: 8px 0;
      line-height: 1.6;
    }
    .receipt-details strong {
      color: #2d4734;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #999;
    }
    .icon {
      width: 40px;
      height: 40px;
      margin: 0 auto 10px;
    }
    .icon img {
      max-width: 100%;
    }
    .button {
      display: inline-block;
      background-color: #34b233;
      color: #fff;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      margin-top: 20px;
      font-weight: bold;
    }
    @media (max-width: 600px) {
      .container {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Payment Received</h2>
      <p>We value working with you!</p>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We have successfully received your payment via M-PESA. Below are the transaction details:</p>

      <div class="receipt-details">
        <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
        <p><strong>Amount Paid:</strong> <span style="color: #34b233;">KES ${amount}</span></p>
        <p><strong>Transaction Date:</strong> ${transactionDate}</p>
        <p><strong>Business Name:</strong> ${businessName}</p>
      </div>

      <p>If you did not authorize this transaction or have any questions, please contact our support team immediately.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${businessName}. Powered by M-PESA.</p>
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

module.exports = {
  sendEmail,
  sendPermissionsEmail,
  sendTestEmail,
  sendTransactionReceipt,
  formatDate,
  uploadImage,
  sendNotification,
  getPlanName,
  emitNotification,
};
