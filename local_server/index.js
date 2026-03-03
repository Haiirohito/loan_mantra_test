require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { randomUUID } = require("crypto");
const serverless = require("serverless-http");

const app = express();

/* =====================================================
   GLOBAL CORS
===================================================== */
const allowedOrigin =
  process.env.ALLOWED_ORIGIN || "https://main.d8tu8g8fumigb.amplifyapp.com";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

app.use(bodyParser.json());

/* =====================================================
   AWS Clients
===================================================== */
const region = process.env.AWS_REGION || "ap-south-1";

const dynamo = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(dynamo);

const ses = new SESClient({ region });

const CUSTOMERS_TABLE = process.env.CUSTOMERS_TABLE || "Customers";
const REQUESTS_TABLE = process.env.REQUESTS_TABLE || "Requests";

const FROM_EMAIL = "devdeepnarayan@gmail.com"; // VERIFY THIS IN SES
const DSA_EMAILS = ["haiirohito@gmail.com"];

/* =====================================================
   EMAIL FUNCTIONS
===================================================== */
async function sendEmail(toAddresses, subject, htmlBody) {
  try {
    const recipients = Array.isArray(toAddresses) ? toAddresses : [toAddresses];

    const command = new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: recipients },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: htmlBody } },
      },
    });

    const result = await ses.send(command);
    console.log("Email sent successfully:", result.MessageId);
  } catch (err) {
    console.error("SES ERROR:", err);
  }
}

function customerEmailTemplate(name, formName) {
  return `
    <h2>Thank you for contacting LoanMantrra</h2>
    <p>Hi ${name || "there"},</p>
    <p>We have received your request for <b>${formName}</b>.</p>
    <p>Our team will contact you shortly.</p>
    <br/>
    <p>Regards,<br/>LoanMantrra Team</p>
  `;
}

function leadEmailTemplate(body) {
  return `
    <h2>🔥 New Lead Received</h2>
    <p><b>Name:</b> ${body.applicantName || "-"}</p>
    <p><b>Email:</b> ${body.email}</p>
    <p><b>Phone:</b> ${body.phone || "-"}</p>
    <p><b>Form:</b> ${body.formName}</p>
    <p><b>Type:</b> ${body.type}</p>
    <hr/>
    <pre>${JSON.stringify(body, null, 2)}</pre>
  `;
}

/* =====================================================
   FIND OR CREATE CUSTOMER
===================================================== */
async function findOrCreateCustomer(name, email, phone) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: CUSTOMERS_TABLE,
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    }),
  );

  if (result.Items?.length > 0) {
    const existing = result.Items[0];

    await docClient.send(
      new UpdateCommand({
        TableName: CUSTOMERS_TABLE,
        Key: { customerId: existing.customerId },
        UpdateExpression: "SET lastSubmissionAt = :now",
        ExpressionAttributeValues: { ":now": new Date().toISOString() },
      }),
    );

    return existing.customerId;
  }

  const customerId = randomUUID();

  await docClient.send(
    new PutCommand({
      TableName: CUSTOMERS_TABLE,
      Item: {
        customerId,
        name: name || "",
        email,
        phone: phone || "",
        createdAt: new Date().toISOString(),
        lastSubmissionAt: new Date().toISOString(),
      },
    }),
  );

  return customerId;
}

/* =====================================================
   ROUTES
===================================================== */
app.get("/", (req, res) => res.json({ status: "API working 🚀" }));

app.post("/api/submissions", async (req, res) => {
  const body = req.body || {};

  if (!body.email || !body.formName)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    const customerId = await findOrCreateCustomer(
      body.applicantName,
      body.email,
      body.phone,
    );

    const requestId = randomUUID();

    await docClient.send(
      new PutCommand({
        TableName: REQUESTS_TABLE,
        Item: {
          requestId,
          customerId,
          type: body.type || "loan",
          formName: body.formName,
          loanCategory: body.loanType || "",
          channel: body.channel || "web",
          createdAt: new Date().toISOString(),
          payload: body,
        },
      }),
    );

    // SEND EMAILS (non-blocking)
    sendEmail(
      body.email,
      "We received your request - LoanMantrra",
      customerEmailTemplate(body.applicantName, body.formName),
    ).catch(console.error);

    sendEmail(DSA_EMAILS, "New Lead Received", leadEmailTemplate(body)).catch(
      console.error,
    );

    return res.status(201).json({ id: requestId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports.handler = serverless(app);
