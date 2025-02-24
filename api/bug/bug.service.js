import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

const PAGE_SIZE = 3

export const bugService = {
	remove,
	query,
	getById,
	add,
	update,
	// addCarMsg,
	// removeCarMsg,
}

async function query(filterBy = { txt: '' }) {
    
	try {
        const criteria = _buildCriteria(filterBy)
        const sort = _buildSort(filterBy)

		const collection = await dbService.getCollection('bug')
		
		var bugCursor = await collection.find(criteria, { sort })

		if (filterBy.pageIdx !== undefined) {
			bugCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
		}

		const bugs = bugCursor.toArray()
		return bugs
	} catch (err) {
		logger.error('cannot find bugs', err)
		throw err
	}
}

async function getById(bugId) {
	try {
        const criteria = { _id: ObjectId.createFromHexString(bugId) }

		const collection = await dbService.getCollection('bug')
		const bug = await collection.findOne(criteria)
        
		bug.createdAt = bug._id.getTimestamp()
		return bug
	} catch (err) {
		logger.error(`while finding bug ${bugId}`, err)
		throw err
	}
}

async function remove(bugId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: creatorId, isAdmin } = loggedinUser
	
	try {
        const criteria = { 
            _id: ObjectId.createFromHexString(bugId), 
        }
        if(!isAdmin) criteria['creator._id'] = creatorId
        
		const collection = await dbService.getCollection('bug')
		const res = await collection.deleteOne(criteria)

        if(res.deletedCount === 0) throw('Not your bug')
		return bugId
	} catch (err) {
		logger.error(`cannot remove bug ${bugId}`, err)
		throw err
	}
}

async function add(bug) {
	try {
		const collection = await dbService.getCollection('bug')
		await collection.insertOne(bug)

		return bug
	} catch (err) {
		logger.error('cannot insert bug', err)
		throw err
	}
}


//updateing only sevirity
async function update(bug) { 
    const bugToSave = { 
		severity:bug.severity
	 }

    try {
        const criteria = { _id: ObjectId.createFromHexString(bug._id) }

		const collection = await dbService.getCollection('bug')
		await collection.updateOne(criteria, { $set: bugToSave })

		return bug
	} catch (err) {
		logger.error(`cannot update car ${bug._id}`, err)
		throw err
	}
}

// async function addCarMsg(carId, msg) {
// 	try {
//         const criteria = { _id: ObjectId.createFromHexString(carId) }
//         msg.id = makeId()
        
// 		const collection = await dbService.getCollection('car')
// 		await collection.updateOne(criteria, { $push: { msgs: msg } })

// 		return msg
// 	} catch (err) {
// 		logger.error(`cannot add car msg ${carId}`, err)
// 		throw err
// 	}
// }

// async function removeCarMsg(carId, msgId) {
// 	try {
//         const criteria = { _id: ObjectId.createFromHexString(carId) }

// 		const collection = await dbService.getCollection('car')
// 		await collection.updateOne(criteria, { $pull: { msgs: { id: msgId }}})
        
// 		return msgId
// 	} catch (err) {
// 		logger.error(`cannot remove car msg ${carId}`, err)
// 		throw err
// 	}
// }

function _buildCriteria(filterBy) {
    const criteria = {
        title: { $regex: filterBy.txt, $options: 'i' },
        severity: { $gte: filterBy.minSeverity },
    }

    return criteria
}

function _buildSort(filterBy) {
    if(!filterBy.sortField) return {}
    return { [filterBy.sortField]: filterBy.sortDir }
}