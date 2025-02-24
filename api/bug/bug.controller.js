import { logger } from '../../services/logger.service.js'
import { bugService } from './bug.service.js'

export async function getBugs(req, res) {
	try {
		const filterBy = {
			txt: req.query.txt || '',
			minSeverity: +req.query.minSeverity || 0,
            sortField: req.query.sortField || '',
            sortDir: req.query.sortDir || 1,
			pageIdx: req.query.pageIdx,
		}
		const bugs = await bugService.query(filterBy)
		res.json(bugs)
	} catch (err) {
		logger.error('Failed to get bugs', err)
		res.status(400).send({ err: 'Failed to get bugs' })
	}
}

export async function getBugById(req, res) {
	try {
		const bugId = req.params.id
		const bug = await bugService.getById(bugId)
		res.json(bug)
	} catch (err) {
		logger.error('Failed to get bug', err)
		res.status(400).send({ err: 'Failed to get bug' })
	}
}

export async function addBug(req, res) {
	const { loggedinUser, body: bug } = req

	try {
		bug.creator = loggedinUser
		const addedBug = await bugService.add(bug)
		res.json(addedBug)
	} catch (err) {
		logger.error('Failed to add bug', err)
		res.status(400).send({ err: 'Failed to add bug' })
	}
}

export async function updateBug(req, res) {
	const { loggedinUser, body: bug } = req
    const { _id: userId, isAdmin } = loggedinUser

    if(!isAdmin && bug.creator._id !== userId) {
        res.status(403).send('Not your bug...')
        return
    }

	try {
		const updatedBug = await bugService.update(bug)
		res.json(updatedBug)
	} catch (err) {
		logger.error('Failed to update bug', err)
		res.status(400).send({ err: 'Failed to update bug' })
	}
}

export async function removeBug(req, res) {
	try {
		const bugId = req.params.id
		const removedId = await bugService.remove(bugId)

		res.send(removedId)
	} catch (err) {
		logger.error('Failed to remove bug', err)
		res.status(400).send({ err: 'Failed to remove bug' })
	}
}

// export async function addCarMsg(req, res) {
// 	const { loggedinUser } = req

// 	try {
// 		const carId = req.params.id
// 		const msg = {
// 			txt: req.body.txt,
// 			by: loggedinUser,
// 		}
// 		const savedMsg = await carService.addCarMsg(carId, msg)
// 		res.json(savedMsg)
// 	} catch (err) {
// 		logger.error('Failed to update car', err)
// 		res.status(400).send({ err: 'Failed to update car' })
// 	}
// }

// export async function removeCarMsg(req, res) {
// 	try {
// 		const { id: carId, msgId } = req.params

// 		const removedId = await carService.removeCarMsg(carId, msgId)
// 		res.send(removedId)
// 	} catch (err) {
// 		logger.error('Failed to remove car msg', err)
// 		res.status(400).send({ err: 'Failed to remove car msg' })
// 	}
// }
