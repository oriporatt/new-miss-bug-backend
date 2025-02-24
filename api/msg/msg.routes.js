import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getMsgs, getMsgById, addMsg, updateMsg, removeMsg} from './msg.controller.js'


const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, getMsgs)
router.get('/:id', log, getMsgById)
router.post('/', log, requireAuth, addMsg)
router.put('/:id', requireAuth, updateMsg)
router.delete('/:id', requireAuth, removeMsg)
// router.delete('/:id', requireAuth, requireAdmin, removeCar)


export const msgRoutes = router