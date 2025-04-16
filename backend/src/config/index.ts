import "dotenv/config";
const config = {
  PORT: process.env.PORT,
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  REDIRECT_URL: process.env.REDIRECT_URL,
  AI_API: process.env.AI_API,
  FRONTEND_URL:process.env.FRONTEND_URL
};

export default config;
