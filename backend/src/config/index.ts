const config = {
  PORT: process.env.PORT,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  AI_API: process.env.AI_API,
  FRONTEND_URL:process.env.FRONTEND_URL,
  REDIS_CLIENT:String(process.env.REDIS_CLIENT_DEV),
  REDIRECT_URL:process.env.REDIRECT_URL,
  JWT_SECRET:process.env.JWT_SECRET
};

export default config;
