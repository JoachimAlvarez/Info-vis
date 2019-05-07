var path = require('path');
var db   = require(path.resolve('./', 'db.js'));

// ----------------------------------------------------------------------------------------
// Init

let FOOD_GROUPS_JSON = {
	'name' : "foods",
	'children' : []
};

function init() {
	let get_foodgroup_sql = "select food_group from foods group by food_group"; 
	db.query(get_foodgroup_sql, (err, result, fields) => {
		if (err) {console.log(err)}

		result.forEach(res => {
			const food_group = res.food_group;
			let subgroups = [];

			let get_subgroup_of_foodgroup_sql = "select distinct food_subgroup from foods where food_group='"+food_group+"'"; 
			db.query(get_subgroup_of_foodgroup_sql, (err, result, fields) => {
				if (err) {console.log(err)};

				result.forEach(res => {
					const food_subgroup = res.food_subgroup;
					let foods = [];

					let get_food_of_subgroup_sql = 'select distinct id,name,name_scientific,description from foods where food_subgroup="' + food_subgroup + '"';
					db.query(get_food_of_subgroup_sql, (err, result, fields) => {
						if (err) {console.log(err)};

						foods = Array.from(result, res => {
							return {
								name: res.name,
								id: res.id,
								name_scientific: res.name_scientific,
								description: res.description,
								size: 1
							}
						});
						subgroups.push({"name" : res.food_subgroup, "children" : foods});
					});
					
				});			
			});
			FOOD_GROUPS_JSON.children.push({"name":food_group, "children": subgroups});		
		});
  	});
}
init();

// ----------------------------------------------------------------------------------------
// API

module.exports = function (app) {

	app.get('/getFoodGroups', (req, res) => {
		const food_name = req.body.food_name;
		let result = FOOD_GROUPS_JSON;
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