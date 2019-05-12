var path = require('path');
var db   = require(path.resolve('./', 'db.js'));

// ----------------------------------------------------------------------------------------
// Init

let uninited = {
	'name' : "foods",
	'children' : []
};
let FOOD_GROUPS_JSON = {
	'name' : "foods",
	'children' : []
};
let NAMES = [];

function init() {
	
	// --------------------------------------------
	// Food Group

	let get_foodgroup_sql = "select food_group from foods group by food_group"; 
	db.query(get_foodgroup_sql, (err, result, fields) => {
		if (err) {console.log(err)}

		result.forEach(res => {
			const food_group = res.food_group;
			let subgroups = [];
			NAMES.push(food_group);

			// --------------------------------------------
			// Food Subgroup

			let get_subgroup_of_foodgroup_sql = "select distinct food_subgroup from foods where food_group='"+food_group+"'"; 
			db.query(get_subgroup_of_foodgroup_sql, (err, result, fields) => {
				if (err) {console.log(err)};

				result.forEach(res => {
					const food_subgroup = res.food_subgroup;
					let foods = [];
					NAMES.push(food_subgroup);

 					// --------------------------------------------
					// Food

					let get_food_of_subgroup_sql = 'select distinct id,name,name_scientific,description from foods where food_subgroup="' + food_subgroup + '"';
					db.query(get_food_of_subgroup_sql, (err, result, fields) => {
						if (err) {console.log(err)};


						foods = Array.from(result, res => {
							NAMES.push(res.name);
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

module.exports = app => {

	app.get('/getFoodGroups', (req, res) => {
		let result = FOOD_GROUPS_JSON;
    	if (result === uninited) { res.status(500).send({status: "err, init is not finished/run"}); }
    	else { res.json({json: FOOD_GROUPS_JSON, names: NAMES}); }
  	});

	// ---------------------------------------------------------------------------------
	// Request Pages
	app.get('/home', (req, res) => {
		res.sendFile('homepage.html', {root: path.join(__dirname, '../views/')});
	});
};