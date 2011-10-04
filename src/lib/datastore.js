module.exports = function(options) {
	options = options || {};

	var fs = require('fs'),
		storeFolder = options.storeLocation || __dirname + '/data/',
		storeExtension = options.storeExtension || '.json';

	return {
		load: function(store, callback) {
			var storeLocation = storeFolder + store + storeExtension,
				data = JSON.parse(fs.readFileSync(storeLocation, 'utf8'));

			return {
				data: data,

				persist: function() {
					fs.writeFileSync(storeLocation, JSON.stringify(this.data));
				},

				add: function(key, value, overwrite) {
					if (overwrite !== true && this.data[key]) return false;

					this.data[key] = value;

					return true;
				},

				set: function(key, updates) {
					for(value in updates) {
						this.data[key][value] = updates[value];
					}

					return true;
				},

				delete: function(key) {
					return delete this.data[key];
				}
			}
		}
	}
};