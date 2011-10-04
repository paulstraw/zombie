var ds = require('./lib/datastore')(),
	players = ds.load('players');

	console.log(players.add('paulstraw12', {hello: 'world'}));

	players.persist();