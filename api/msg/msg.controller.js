import { logger } from '../../services/logger.service.js'
import { msgService } from './msg.service.js'
import { ObjectId } from 'mongodb'

export async function getMsgs(req, res) {
	try {
		const filterBy = {
			txt: req.query.txt || '',
		}
		const msgs = await msgService.query(filterBy)
		res.json(msgs)
	} catch (err) {
		logger.error('Failed to get msgs', err)
		res.status(400).send({ err: 'Failed to get msgs' })
	}
}

export async function getMsgById(req, res) {
	try {
		const msgId = req.params.id
		const msg = await msgService.getById(msgId)
		res.json(msg)
	} catch (err) {
		logger.error('Failed to get msg', err)
		res.status(400).send({ err: 'Failed to get msg' })
	}
}

export async function addMsg(req, res) {
	const { loggedinUser, body: msg } = req

	try {
		msg.byUserId = loggedinUser._id 
		//store it as a object
		if (msg.byUserId && typeof msg.byUserId === 'string') {
			msg.byUserId = ObjectId.createFromHexString(msg.byUserId);
		}
		const addedMsg = await msgService.add(msg)
		res.json(addedMsg)
	} catch (err) {
		logger.error('Failed to add msg', err)
		res.status(400).send({ err: 'Failed to add msg' })
	}
}

export async function updateMsg(req, res) {
	const { loggedinUser, body: msg } = req
    const { _id: userId, isAdmin } = loggedinUser

    if(!isAdmin && msg.byUserId !== userId) {
        res.status(403).send('Not your msg...')
        return
    }

	try {
		const updatedMsg = await msgService.update(msg)
		res.json(updatedMsg)
	} catch (err) {
		logger.error('Failed to update msg', err)
		res.status(400).send({ err: 'Failed to update msg' })
	}
}

export async function removeMsg(req, res) {
	try {
		const msgId = req.params.id
		const removedId = await msgService.remove(msgId)
		res.send(removedId)
	} catch (err) {
		logger.error('Failed to remove msg', err)
		res.status(400).send({ err: 'Failed to remove msg' })
	}
}

