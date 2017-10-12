const MongoClient = require('mongodb').MongoClient

const request = require('request-promise');
const assert = require('assert');

module.exports = (params) => {
	var database, collection;

	return new Promise(async(resolve, reject) => {
		try	{
			if(!database && !collection) {
				database = await MongoClient.connect(`${params.database.server}/${params.database.name}`);
				collection = await database.collection('posts');
			}

			result = await request({ uri: params.api, json: true });

			result.hits.forEach((post, err) => {
				collection.updateOne({
					'objectID': post.objectID
				}, {
					'$set': post
				}, {
					'upsert': true
				});
			});
			resolve();
		} catch (e) {
			console.log(e)
			reject(e);
		}
	});
}

