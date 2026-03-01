# Deploying the Backend (local_server)

This guide describes how to deploy the Node.js backend to a cloud provider like Render, Railway, or Heroku, and how to connect your static frontend to it.

## 1. Environment Variables
When deploying the `local_server`, you must set the following environment variables in your hosting provider's dashboard:
*   `NODE_ENV`: Set this to `production`.
*   `JWT_SECRET`: Generate a long, random string. This secures administrative logins. Do **not** use the default development secret.
*   `ALLOWED_ORIGINS`: A comma-separated list of EXACT URLs where your frontend is hosted. Example: `https://tricolor-leads.vercel.app,https://www.tricolorleads.com`. (Do not include a trailing slash).
*   `PORT`: Your provider usually injects this automatically.

## 2. Database Connection (DynamoDB)
The backend uses **AWS DynamoDB** instead of a local file-based database (`db.json`) to store submissions. Make sure you set up a table named `LoanSubmissions` in your AWS dashboard, with `submissionId` as the Partition Key (String).

To permit the Node.js server to access the DynamoDB table, you must also provide standard AWS credentials. When deploying, include:
*   `AWS_REGION`: e.g., `us-east-1` or `ap-south-1`.
*   `DYNAMODB_TABLE_NAME`: The name of the table if not `LoanSubmissions`.
*   And appropriate AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) or an IAM role for EC2/ECS/Lambda.

## 3. Deploying the Frontend
After deploying your backend, you will receive a live URL (e.g., `https://tricolor-api.onrender.com`).
When you deploy your React frontend (to Vercel, Netlify, etc.), you MUST add the following environment variable to the frontend project:
*   `VITE_API_BASE_URL`: Set this to your live backend URL (e.g., `https://tricolor-api.onrender.com`).

If you forget this, your live frontend will try to contact `http://localhost:4000` and fail.
