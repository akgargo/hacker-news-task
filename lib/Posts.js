const MongoDB = require('mongodb').MongoClient;

module.exports = class Posts {
	constructor(params) {
		this.params = params;
	}

	verifyConnection() {
		return new Promise(async (resolve, reject) => {
			try {
				if(!this.database) {
					this.database = await MongoDB.connect(`${this.params.server}/${this.params.name}`);
				}
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	disablePosts(profile, post_id) {
		return new Promise(async (resolve, reject) => {
			try {
				await this.verifyConnection();

				let profilesCollection = await this.database.collection('profiles');

				let exists = (await profilesCollection.find({ profile: profile }).toArray())
				if (exists.length <= 0) {
					await profilesCollection.insert({ profile: profile, removed: [post_id], favourites: [] });
				} else {
					await profilesCollection.updateOne({ profile: profile }, { $push: { removed: post_id } });
				}	
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	addFavouritePosts(profile, post_id) {
		return new Promise(async (resolve, reject) => {
			try {
				await this.verifyConnection();

				let profilesCollection = await this.database.collection('profiles');

				let exists = (await profilesCollection.find({ profile: profile }).toArray())
				if (exists.length <= 0) {
					await profilesCollection.insert({ profile: profile, removed: [], favourites: [post_id] });
				} else {
					await profilesCollection.updateOne({ profile: profile }, { $push:  { favourites:post_id } });
				}
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	removeFavouritePosts(profile, post_id) {
		return new Promise(async (resolve, reject) => {
			try {
				await this.verifyConnection();

				let profilesCollection = await this.database.collection('profiles');

				let exists = (await profilesCollection.find({ profile: profile }).toArray())
				if (exists.length <= 0) {
					await profilesCollection.insert({ profile: profile, removed: [], favourites: [post_id] });
				} else {
					await profilesCollection.updateOne({ profile: profile }, { $pull: { favourites: post_id } });
				}
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	getPosts(profile) {
		return new Promise(async (resolve, reject) => {
			try {
				await this.verifyConnection();
				
				let profilesCollection = await this.database.collection('profiles');
				let postsCollection = await this.database.collection('posts');
				let exists = await profilesCollection.find({profile: profile}).toArray();

				let favourites_ids, removed_ids

				if(exists.length > 0) {
			    favourites_ids = (await profilesCollection.find({profile: profile}, {_id: 0, favourites: 1}).toArray())[0].favourites ;
			    removed_ids = (await profilesCollection.find({profile: profile}, {_id: 0, removed: 1}).toArray())[0].removed ;
				} else {
			    favourites_ids = removed_ids = [];
				}

		    let favourites = await postsCollection.find({objectID: {$in: favourites_ids}}, {objectID: 1, _id: 0, story_title: 1, title: 1, author: 1, story_url: 1, url: 1, created_at: 1}).sort({created_at: -1})
		    .toArray();
		    let common = await postsCollection.find({objectID: {$nin: new Array().concat(removed_ids, favourites_ids)}}, {objectID: 1, _id: 0, story_title: 1, title: 1, author: 1, story_url: 1, url: 1, created_at: 1})
		    .sort({created_at: -1}).toArray();

				resolve({favourites: favourites, common: common});
			} catch (e) {
				console.log(e)
				reject(e);
			}
		});
	}
}