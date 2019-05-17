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

const foodgroup_sql = "select food_group from foods group by food_group";
const food_subgroup_sql = food_group => "select distinct food_subgroup from foods where food_group='"+food_group+"'" ;
const food_sql = food_subgroup => 'select distinct id,name,name_scientific,description from foods where food_subgroup="'+food_subgroup+'"';

const foodgroup_grade_sql = 'select food_group,min(grade),max(grade) from tbl_food_dishes group by food_group';
const food_subgroup_grade_sql = food_group => 'select food_subgroup,min(grade),max(grade) from tbl_food_dishes group by food_group,food_subgroup having food_group="'+food_group+'"';
const food_grade_sql = food_subgroup => 'select food_id,food_name,min(grade),max(grade) from tbl_food_dishes group by food_subgroup,food_name,food_id having food_subgroup="'+food_subgroup+'"';

function init() {
	
	// ------------ Food Group --------------------------------

	db.query(foodgroup_sql, (err, food_groups, fields) => {
		if (err) {console.log(err)}
		let min_grades = {};
		let max_grades = {};

		db.query(foodgroup_grade_sql, (err, food_groups_grades, fields) => {
			if (err) {console.log(err)};

			food_groups_grades.forEach(res => {
				const food_group = res.food_group;
				min_grades[food_group] = res['min(grade)'];
				max_grades[food_group] = res['max(grade)'];
			});

			food_groups.forEach(res => {
				const food_group = res.food_group;
				NAMES.push(food_group);
				let subgroups = [];
	
				// ------------ Food Subgroup --------------------------------
	
				db.query(food_subgroup_sql(food_group), (err, food_subgroups, fields) => {
					if (err) {console.log(err)};
					let min_grades_subgroups = {};
					let max_grades_subgroups = {};
	
					db.query(food_subgroup_grade_sql(food_group), (err, food_subgroups_grades, fields) => {
						if (err) {console.log(err)};

						food_subgroups_grades.forEach(res => {
							const food_subgroup = res.food_subgroup;
							min_grades_subgroups[food_subgroup] = res['min(grade)'];
							max_grades_subgroups[food_subgroup] = res['max(grade)'];
						});
					
						food_subgroups.forEach(res => {
							const food_subgroup = res.food_subgroup;
							NAMES.push(food_subgroup);
							let foods = [];					
		
 							// ------------ Food --------------------------------
		
							db.query(food_sql(food_subgroup), (err, result, fields) => {
								if (err) {console.log(err)};
								let min_grades_food = {};
								let max_grades_food = {};
			
								db.query(food_grade_sql(food_subgroup), (err, food_grades, fields) => {
									if (err) {console.log(err)};

									food_grades.forEach(res => {
										const food_name = res.food_name;
										min_grades_food[food_name] = res['min(grade)'];
										max_grades_food[food_name] = res['max(grade)'];
									});
									foods = Array.from(result, res => {
										NAMES.push(res.name);
										return {
											name: res.name,
											id: res.id,
											name_scientific: res.name_scientific,
											description: res.description,
											min_grade : min_grades_food[res.name],
											max_grade : max_grades_food[res.name], 
											size: 1
										}
									});
									const food_subgroup_info = {
										name : food_subgroup, 
										min_grade : min_grades_subgroups[food_subgroup], 
										max_grade : max_grades_subgroups[food_subgroup], 
										children : foods
									}
									subgroups.push(food_subgroup_info);
								});
							});		
						});
					});
					const food_group_info = {
						name : food_group, 
						min_grade : min_grades[food_group], 
						max_grade : max_grades[food_group], 
						children : subgroups
					}
					FOOD_GROUPS_JSON.children.push(food_group_info);					
				});
				init_done = true;
			});
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
		while (!init_done) {};
		let result = FOOD_GROUPS_JSON;
   		res.json({json: FOOD_GROUPS_JSON, names: NAMES});
  	});

  	app.get('/getFoodByCompounds', (req, res) => {
  		let compounds = req.body.compounds;
		let result = []; f
		let names = []; 

		let sql;
		db.query(food_sql(food_subgroup), (err, result, fields) => {
			return

			res.json({json: result, names: names});
		});
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