var path = require('path');
var db   = require(path.resolve('./', 'db.js'));

// ----------------------------------------------------------------------------------------
// Init

let FOOD_GROUPS_JSON = {
	'name' : "foods",
	'children' : []
};
let NAMES = [];

let init_done = false;

const foodgroup_sql = 'select food_group,min(grade),max(grade) from tbl_food_dishes group by food_group';
const food_subgroup_sql = food_group => 'select food_subgroup,min(grade),max(grade) from tbl_food_dishes group by food_group,food_subgroup having food_group="'+food_group+'"';
const food_sql = food_subgroup => 'select food_id,food_name,name_scientific,description,min(grade),max(grade) from tbl_food_dishes group by food_subgroup,food_name,food_id,name_scientific,description having food_subgroup="'+food_subgroup+'"';


function init() {
	
	// ------------ Food Group --------------------------------

	db.query(foodgroup_sql, (err, food_groups, fields) => {
		if (err) {console.log(err)}
		
		food_groups.forEach(res => {
			const food_group = res.food_group;
			const min_grade = res['min(grade)'];
			const max_grade = res['max(grade)'];
			NAMES.push(food_group);
			let subgroups = [];
	
			// ------------ Food Subgroup --------------------------------
	
			db.query(food_subgroup_sql(food_group), (err, food_subgroups, fields) => {
				if (err) {console.log(err)};
				
					food_subgroups.forEach(res => {
						const food_subgroup = res.food_subgroup;
						const min_grade = res['min(grade)'];
						const max_grade = res['max(grade)'];
						NAMES.push(food_subgroup);
						let foods = [];					
		
 						// ------------ Food --------------------------------
		
						db.query(food_sql(food_subgroup), (err, result, fields) => {
							if (err) {console.log(err)};

							foods = Array.from(result, res => {
								NAMES.push(res.food_name);
								return {
									name: res.food_name,
									id: res.food_id,
									name_scientific: res.name_scientific,
									description: res.description,
									min_grade : res['min(grade)'],
									max_grade : res['max(grade)'],
									size: 1
								}
							});
							const food_subgroup_info = {
								name : food_subgroup, 
								min_grade : min_grade,
								max_grade : max_grade,
								children : foods
							}
							subgroups.push(food_subgroup_info);
						});
					});		
				});
				const food_group_info = {
					name : food_group, 
					min_grade : min_grade, 
					max_grade : max_grade, 
					children : subgroups
				}
				FOOD_GROUPS_JSON.children.push(food_group_info);					
			init_done = true;
		});
  	});
}
	
						/*
						result.forEach(res => {
							const food_id = res.id;

							// --------------------------------------------
							// Dishes

							let get_dishes_of_food_sql = 'select distinct dish_name from tbl_food_dishes where food_id="' + food_id + '"';
							db.query(get_dishes_of_food_sql, (err, result, fields) => {
								if (err) {console.log(err)};

								foods.push({
									name: res.name,
									id: res.id,
									name_scientific: res.name_scientific,
									description: res.description,
									children: Array.from(result, dish => { return {
										name : dish.dish_name,
										size: 1}
									})
								});
							});

						});	
						*/
					
init();

// ----------------------------------------------------------------------------------------
// API

module.exports = app => {

	app.get('/getFoodGroups', (req, res) => {
		while (!init_done) {

		};
		let result = FOOD_GROUPS_JSON;
   		res.json({json: FOOD_GROUPS_JSON, names: NAMES});
  	});

  	app.get('/getFoodByCompounds', (req, res) => {
  		let compounds = req.body.compounds;
		let result = []; f
		let names = []; 

		let sql;
		/*
		db.query(food_sql(food_subgroup), (err, result, fields) => {
			return

			res.json({json: result, names: names});
		});
		*/
  	});

	// ---------------------------------------------------------------------------------
	// Request Pages
	app.get('/home', (req, res) => {
		res.sendFile('homepage.html', {root: path.join(__dirname, '../views/')});
	});

	app.get('/style.css', (req, res) => {
		res.type('text/css');
		res.sendFile('style.css', {root: path.join(__dirname, '../views/')});
	});

	app.get('/script.js', (req, res) => {
		res.type('text/javascript');
		res.sendFile('script.js', {root: path.join(__dirname, '../views/')});
	});
};