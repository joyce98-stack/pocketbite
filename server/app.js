import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import helmet from 'helmet'
import express from 'express'
import router from './router/router.js'
import compression from 'compression'
import { Borgen, Logger } from 'borgen'
import { Config } from './utils/config.js'
import cookieParser from 'cookie-parser'
// import connectDb from './database/connectDb.js' // Commented out for now

const app = express()
const server = http.createServer(app)

// Middleware
app.use(
  cors({
    origin: [
      Config.FRONTEND_URL || 'http://localhost:3000', // Fallback if Config isn't set
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
)

app.use(helmet())
app.use(Borgen({}))
app.use(compression())
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.set('trust proxy', true)

app.use('/', router)

const startServer = async () => {
  // Using a fallback port (3001) just in case Config.SERVER_PORT is undefined
  const PORT = Config.SERVER_PORT || 3001; 
  
  server.listen(PORT, () => {
    Logger.info({
      message: `Server is listening on port ${PORT}`,
      messageColor: 'greenBright',
      infoColor: 'whiteBright',
    })
  })
}

// Connect to the database. Then Start Server
// connectDb(startServer) 

// Start the server directly instead
startServer();