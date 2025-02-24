import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getBugs, getBugById, addBug, updateBug, removeBug} from './bug.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, getBugs)
router.get('/:id', log, getBugById)
router.post('/', log, requireAuth, addBug)
router.put('/:id', requireAuth, updateBug)
router.delete('/:id', requireAuth, removeBug)
// router.delete('/:id', requireAuth, requireAdmin, removeCar)

// router.post('/:id/msg', requireAuth, addCarMsg)
// router.delete('/:id/msg/:msgId', requireAuth, removeCarMsg)

export const bugRoutes = router