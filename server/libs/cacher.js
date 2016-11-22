"use strict";

let config    	= require("../config");
let logger    	= require("../core/logger");
let redis 		= require("../core/redis");

let _ 			= require("lodash");
/**
 * Cache class. Use prefixes and TTL
 * 
 * @class Cacher
 */
class Cacher {

	/**
	 * Creates an instance of Cacher.
	 * 
	 * @param {any} type
	 * @param {any} prefix
	 * @param {any} ttl
	 * 
	 * @memberOf Cacher
	 */
	constructor(prefix, ttl) {
		this.prefix = prefix ? prefix + ":" : "";
		this.ttl = ttl;
	}

	/**
	 * Get data from cache by key
	 * 
	 * @param {any} key
	 * @returns {Promise}
	 *  
	 * @memberOf Cacher
	 */
	get(key) {
		return redis.get(this.prefix + key).then((data) => {
			if (data) {
				try {
					return JSON.parse(data);						
				} catch (err) {
					logger.error("Redis result parse error!", err);
				}				
			}
			return data;
		});
	}

	/**
	 * Set data to cache by key
	 * 
	 * @param {any} key
	 * @param {any} data JSON object
	 * 
	 * @memberOf Cacher
	 */
	set(key, data) {
		if (_.isObject(data))
			data = JSON.stringify(data);

		if (this.ttl) {
			redis.setex(this.prefix + key, this.ttl, data, (err) => {
				if (err)
					logger.error("Redis `setex` error!", err);
			});
		} else {
			redis.set(this.prefix + key, data, (err) => {
				if (err)
					logger.error("Redis `set` error!", err);
			});
		}
	}

	/**
	 * Delete a key from cache
	 * 
	 * @param {any} key
	 * 
	 * @memberOf Cacher
	 */
	del(key) {
		redis.del(this.prefix + key, (err) => {
			if (err)
				logger.error("Redis `del` error!", err);
		});
	}

	/**
	 * Clean cache. Remove every key by prefix
	 * // http://stackoverflow.com/questions/4006324/how-to-atomically-delete-keys-matching-a-pattern-using-redis
	 * 
	 * @memberOf Cacher
	 */
	clean() {
		let self = this;
		let scanDel = function (cursor, cb) {
			redis.scan(cursor, "MATCH", self.prefix + "*", "COUNT", 100, function(err, resp) {
				if (err) return cb(err);
				let nextCursor = parseInt(resp[0]);
				let keys = resp[1];
				// no next cursor and no keys to delete
				if (!nextCursor && !keys.length) return cb(null);

				redis.del(keys, function(err) {
					if (err) return cb(err);
					if (!nextCursor) return cb(null);
					scanDel(nextCursor, cb);
				});
			});
		};

		//return Promise((resolve, reject) => {
		scanDel(0, (err) => {
			if (err)
				//return reject(err);
				logger.error("Redis `scanDel` error!", err);
			
			//resolve();
		});

	}

}
module.exports = Cacher;
