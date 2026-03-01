// local-server/index.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");
const { nanoid } = require("nanoid");
const cors = require("cors");
const path = require("path");

// --- Setup DynamoDB Client ---
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1", // typical region, can be overridden via env
});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "LoanSubmissions";

const app = express();

// CORS configuration for deployment
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:8080", "http://localhost:5173"]; // default dev origins

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) === -1 &&
        process.env.NODE_ENV === "production"
      ) {
        var msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

// DB initialization obsolete with DynamoDB

// --- Public endpoint: create submission ---
app.post("/api/submissions", async (req, res) => {
  const body = req.body || {};
  if (!body || Object.keys(body).length === 0)
    return res.status(400).json({ error: "Empty payload" });

  const type = body.type || "loan"; // loan | contact
  const loanType = body.loanType || "";
  const priority = body.priority || "normal";
  const channel = body.channel || "web";

  // SLA Calculation
  let slaHours = body.slaHours;
  if (!slaHours) {
    if (type === "contact") slaHours = 24;
    else slaHours = 48; // default for loans
  }
  const slaDeadline = new Date(
    Date.now() + slaHours * 3600 * 1000,
  ).toISOString();

  // Clean payload to save storage
  const cleanedPayload = {};
  for (const [key, value] of Object.entries(body)) {
    if (value !== "" && value !== null && value !== undefined) {
      // Skip fields already stored at the root level
      if (
        ![
          "formName",
          "type",
          "loanType",
          "priority",
          "channel",
          "slaHours",
        ].includes(key)
      ) {
        cleanedPayload[key] = value;
      }
    }
  }

  const item = {
    submissionId: nanoid(),
    formName: body.formName || "unknown",
    type,
    loanType,
    priority,
    channel,
    slaHours,
    slaDeadline,
    createdAt: new Date().toISOString(),
    payload: cleanedPayload,
    status: "submitted", // default status
    assignedTo: null,
    assignedAt: null,
    escalated: false,
    tasks: [],
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: null,
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      }),
    );
    return res.status(201).json({
      id: item.submissionId,
      status: item.status,
      slaDeadline: item.slaDeadline,
    });
  } catch (err) {
    console.error("Error saving to DynamoDB:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

// Public upload endpoint (mock)
app.post("/api/submissions/:id/upload", async (req, res) => {
  const id = req.params.id;

  try {
    const { Item: item } = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { submissionId: id },
      }),
    );

    if (!item) return res.status(404).json({ error: "Not found" });

    // Mock upload logic
    item.status = "updated";
    item.lastModifiedAt = new Date().toISOString();

    // Close the open task
    if (item.tasks) {
      item.tasks = item.tasks.map((t) => {
        if (t.type === "upload_docs" && t.status === "pending") {
          return { ...t, status: "completed", completedAt: new Date().toISOString() };
        }
        return t;
      });
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      }),
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error("Error updating in DynamoDB:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

// start server locally if not in a serverless environment
if (!process.env.LAMBDA_TASK_ROOT) {
  app.listen(PORT, () => {
    console.log(`Local server running on http://localhost:${PORT}`);
  });
}

// export for serverless
const serverless = require("serverless-http");
module.exports.handler = serverless(app);
