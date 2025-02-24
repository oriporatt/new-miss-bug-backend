import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'


export const msgService = {
	remove,
	query,
	getById,
	add,
	update,

}

async function query(filterBy = {}) {
	const criteria = _buildCriteria(filterBy)
	try {
		const collection = await dbService.getCollection('msg')
		var msgs = await collection.find(criteria).toArray()
		return msgs
	} catch (err) {
		logger.error('cannot find msgs', err)
		throw err
	}
}

async function getById(msgId) {
	try {
        const criteria = { _id: ObjectId.createFromHexString(msgId) }

		const collection = await dbService.getCollection('msg')
		const msg = await collection.findOne(criteria)
		return msg
	} catch (err) {
		logger.error(`while finding msg ${msgId}`, err)
		throw err
	}
}

async function remove(msgId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { isAdmin } = loggedinUser
	
	try {
        const criteria = { 
            _id: ObjectId.createFromHexString(msgId), 
        }
        if(isAdmin){
			const collection = await dbService.getCollection('msg')
			const res = await collection.deleteOne(criteria)
		} else{
			throw('Only admin allowed to delete')
		}
        // if(res.deletedCount === 0) throw('Not your bug')
		return msgId
	} catch (err) {
		logger.error(`cannot remove msg ${msgId}`, err)
		throw err
	}
}

async function add(msg) {
	try {
		const collection = await dbService.getCollection('msg')
		if (msg.aboutBugId && typeof msg.aboutBugId === 'string') {
			msg.aboutBugId = ObjectId.createFromHexString(msg.aboutBugId);
		}
		await collection.insertOne(msg)
		
		const criteria = { _id: msg._id }

		var outMsg = await collection.aggregate([
			{
				$match: criteria,
			},
			{
				$lookup: {
					localField: 'aboutBugId',
					from: 'bug',
					foreignField: '_id',
					as: 'aboutBug',
				},
			},
			{
				$unwind: '$aboutBug',
			},
			{
				$lookup: {
					localField: 'byUserId',
					from: 'user',
					foreignField: '_id',
					as: 'byUser',
				},
			},
			{
				$unwind: '$byUser',
			},
			{
				$project: {
					'txt': true,
					'aboutBug._id': true, 'aboutBug.title':true, 'aboutBug.severity':true,
					'byUser._id': true, 'byUser.fullname':true
				}
			}
		]).toArray()

		return outMsg[0]||null
	} catch (err) {
		logger.error('cannot insert msg', err)
		throw err
	}
}


//updating only txt ofmsg
async function update(msg) { 
    const msgToSave = { 
		txt:msg.txt
	 }

    try {
        const criteria = { _id: ObjectId.createFromHexString(msg._id) }
		const collection = await dbService.getCollection('msg')
		await collection.updateOne(criteria, { $set: msgToSave })
		return msg
	} catch (err) {
		logger.error(`cannot update msg ${msg._id}`, err)
		throw err
	}
}



function _buildCriteria(filterBy) {
    const criteria = {
        txt: { $regex: filterBy.txt, $options: 'i' }
	}
    return criteria
}

function _buildSort(filterBy) {
    if(!filterBy.sortField) return {}
    return { [filterBy.sortField]: filterBy.sortDir }
}