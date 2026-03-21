
import { Router } from 'express'
import { HttpStatusCode } from 'axios'


const   router = Router()

// Core routes
router.get('/ping', (_, res) => {
	res.status(HttpStatusCode.Ok).json({ message: 'pong', alive: true })
})
router.get('/anything', (_, res) => {
	res.status(HttpStatusCode.Ok).json({ message: 'this is anything', alive: true })
})



export default router
