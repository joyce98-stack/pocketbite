import 'dotenv/config'

export const Config = {
  SERVER_PORT: process.env.SERVER_PORT || 8001,
  JWT_SECRET: process.env.JWT_SECRET ,
  MONGO_URI: process.env.MONGO_URI ,
  UPLOAD_DIR: process.env.UPLOAD_DIR,
  NODE_ENV: process.env.NODE_ENV,
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  FRONTEND_URL: process.env.FRONTEND_URL
}