require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");
const serverless = require("serverless-http");

const app = express();

/* =====================================================
   🔥 GLOBAL CORS FIX (CRITICAL FOR AWS + AMPLIFY)
===================================================== */
const allowedOrigin = "https://main.d3a7mju9zni36v.amplifyapp.com";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

  // handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(bodyParser.json());

/* =====================================================
   DynamoDB Setup
===================================================== */
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "LoanSubmissions";

/* =====================================================
   ROUTES
===================================================== */

// Health check (helps debugging)
app.get("/", (req, res) => {
  res.json({ status: "API working 🚀" });
});

/* ---------- CREATE SUBMISSION ---------- */
app.post("/api/submissions", async (req, res) => {
  const body = req.body || {};
  if (!Object.keys(body).length)
    return res.status(400).json({ error: "Empty payload" });

  const type = body.type || "loan";
  const loanType = body.loanType || "";
  const priority = body.priority || "normal";
  const channel = body.channel || "web";

  let slaHours = body.slaHours || (type === "contact" ? 24 : 48);
  const slaDeadline = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();

  const cleanedPayload = {};
  for (const [key, value] of Object.entries(body)) {
    if (value !== "" && value != null) {
      if (!["formName", "type", "loanType", "priority", "channel", "slaHours"].includes(key)) {
        cleanedPayload[key] = value;
      }
    }
  }

  const item = {
    submissionId: randomUUID(),
    formName: body.formName || "unknown",
    type,
    loanType,
    priority,
    channel,
    slaHours,
    slaDeadline,
    createdAt: new Date().toISOString(),
    payload: cleanedPayload,
    status: "submitted",
  };

  try {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    return res.status(201).json({
      id: item.submissionId,
      status: item.status,
      slaDeadline: item.slaDeadline,
    });
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

/* ---------- UPLOAD DOCS ---------- */
app.post("/api/submissions/:id/upload", async (req, res) => {
  const id = req.params.id;

  try {
    const { Item: item } = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { submissionId: id },
    }));

    if (!item) return res.status(404).json({ error: "Not found" });

    item.status = "updated";

    // remove tasks modification since tasks array is removed from creation

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* =====================================================
   EXPORT FOR AWS LAMBDA
===================================================== */
module.exports.handler = serverless(app);