module.exports = function(data) {
	var crypto = require('crypto'),
		salt = 'VR47%.zYe84az(Aw98+xzb7yqKt2R$?wzub+/CNy';

	return crypto.createHmac('sha256', salt).update(data).digest('hex');
};