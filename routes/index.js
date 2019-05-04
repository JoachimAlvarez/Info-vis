var path = require('path');
var db   = require(path.resolve('./', 'db.js'))

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
		const food_subgroup = req.body.food_subgroup;
		let sql = 'select distinct food_id, food_name from tbl_food_dishes where food_subgroup=' + food_subgroup + ';';
		db.query(sql, (err, result) => {
    		if (err) { res.status(500).send({status: err}); }
    		else { res.json({status: result[0]}); }
  		});
	});
	
	app.get('/getDishRoot', (req, res) => {
		const food_id = req.body.food_id;
		let sql = 'select * from tbl_food_dish_category where food_id = ' + food_id + ' and parent_id = 0;';
		db.query(sql, (err, result) => {
    		if (err) { res.status(500).send({status: err}); }
    		else { res.json({status: result[0]}); }
  		});
	});
	
	app.get('/getDishRecur', (req, res) => {
		const food_id = req.body.food_id;
		let sql = 'select * from tbl_food_dish_category where parent_id = ' + food_id + ';';
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
