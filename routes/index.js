var path = require('path');
var db   = require(path.resolve('./', 'db.js'));

// ----------------------------------------------------------------------------------------
// Constants
const dbname = 'foodb';

// ----------------------------------------------------------------------------------------
// Init

let FOOD_GROUPS = {};

function init() {
	let get_foodgroup_sql = "select food_group from foods group by food_group"; 
	db.query(get_foodgroup_sql, (err, result, fields) => {
		if (err) {console.log(err)}

		result.forEach(res => {
			const food_group = res.food_group;

			let get_subgroup_of_foodgroup_sql = "select distinct food_subgroup from foods where food_group='"+food_group+"'"; 
			db.query(get_subgroup_of_foodgroup_sql, (err, result, fields) => {

				if (err) {console.log(err)};
				let food_subgroups = Array.from(result, res => res.food_subgroup);
				FOOD_GROUPS[food_group] = food_subgroups;
				//console.log(FOOD_GROUPS)
			});
		});
  	});
}
init();

// ----------------------------------------------------------------------------------------
// API

module.exports = function (app) {

	app.get('/getFoodGroups', (req, res) => {
		const food_name = req.body.food_name;
		let result = Object.keys(FOOD_GROUPS);
    	if (result === []) { res.status(500).send({status: "err, init is not finished/run"}); }
    	else { res.json({status: result}); }
  	});

	app.get('/getFoodSubGroups', (req, res) => {
		const food_group = req.body.food_group;
		let result = FOOD_GROUPS[food_group];
		if (result === []) { res.status(500).send({status: "err, init is not finished/run"}); }
    	else { res.json({status: result}); }
	});

	app.get('/getFood', (req, res) => {
		const food_name = req.body.food_name;
		let sql = 'select * from foods where name='+foodname+'';
		db.query(sql, (err, result) => {
    		if (err) { res.status(500).send({status: err}); }
    		else { res.json({status: result[0]}); }
  		});
	});

	// ---------------------------------------------------------------------------------
	// Request Pages
	app.get('/home', function(req, res) {
		res.sendFile('homepage.html', {root: path.join(__dirname, '../views/')});
	});
};


/*
	app.post('/postReq', function(req, res) {
		let sql;
		db.query(sql, (err, result) => {
    		if (err) {
    			res.status(500).send({status: err});
    		}
    		else {
    			res.json({status: result});
    		}
  		});
	});
	*/