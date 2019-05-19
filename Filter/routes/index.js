var path = require('path');
var db   = require(path.resolve('./', 'db.js'));
var timeout = require('connect-timeout');

// ----------------------------------------------------------------------------------------
// Init

let FOOD_GROUPS_JSON = {
	'name' : "foods",
	'children' : []
};
let NAMES = [];

const foodgroup_sql = 'select food_group,min(grade),max(grade) from tbl_food_dishes group by food_group';
const food_subgroup_sql = food_group => 'select food_subgroup,min(grade),max(grade) from tbl_food_dishes group by food_group,food_subgroup having food_group="'+food_group+'"';
const food_sql = food_subgroup => 'select food_id,food_name,name_scientific,description,min(grade),max(grade) from tbl_food_dishes group by food_subgroup,food_name,food_id,name_scientific,description having food_subgroup="'+food_subgroup+'"';

const compoundColumn = compound => compound.replace("(", "_").replace(")", "_").replace(" ", "_");
function compound_filtered_foodgroups_sql(compounds) {
	let sql = 'select d.food_group,min(d.grade),max(d.grade) from tbl_food_dishes d where true ';
	for (i = 0; i < compounds.length ; i++ ) {
		sql += 'and group__'+compoundColumn(compounds[i])+'__without = 1 '
	}
	sql += 'group by food_group';
	return sql;
}

function compound_filtered_food_subgroups_sql(compounds, food_group) {
	let sql = 'select d.food_group,food_subgroup,min(d.grade),max(d.grade) from tbl_food_dishes d where true ';
	for (i = 0; i < compounds.length ; i++ ) {
		sql += 'and subgroup__'+compoundColumn(compounds[i])+'__without = 1 '
	}
	sql += 'group by d.food_group,food_subgroup having food_group="'+food_group+'"';
	return sql;
}

function compound_filtered_foods_sql(compounds, food_subgroup) {
	let sql = 'select d.food_group,food_subgroup,food_name,name_scientific,description,min(d.grade),max(d.grade) from tbl_food_dishes d where true ';
	for (i = 0; i < compounds.length ; i++ ) {
		sql += 'and food__'+compoundColumn(compounds[i])+'__without = 1 '
	}
	sql += 'group by food_group,d.food_subgroup,food_name,name_scientific,description having food_subgroup="'+food_subgroup+'"';
	return sql;
}


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
		});
  	});
}
					
init();

function addFoodGroupInfo(json, name, min_grade, max_grade) {
	json.children.push({
		name : name,
		min_grade : min_grade,
		max_grade : max_grade,
		children : []
	});
}
function addFoodSubgroupInfo(json, parent, name, min_grade, max_grade, foods) {
	json.children.forEach(food_group_info => {
		if (food_group_info.name === parent) {
			food_group_info.children.push({
				name : name,
				min_grade : min_grade,
				max_grade : max_grade,
				children : foods
			});
		}
	});
}

function hasAllChildren(json, food_groups_nr) {
	const food_groups = json.children;
	if (food_groups.length !== food_groups_nr) {
		return false;
	}
	else {
		let result = true;
		food_groups.forEach(food_group => {
			if (food_group.children.length === 0) {
				result = false;
			}
		});
		return result;
	}
}

function getFilteredResults(compounds, callback) {
	let FILTERED_RESULTS = {'name' : "foods", 'children' : []};
	let names = []; 

	db.query(compound_filtered_foodgroups_sql(compounds), (err, food_groups, fields) => {
		if (err) {console.log(err)};
		console.log('food groups: ',food_groups.length)

		food_groups.forEach(food_res => {
			const food_group = food_res.food_group;
			names.push(food_group);
			addFoodGroupInfo(FILTERED_RESULTS, food_group, food_res['min(d.grade)'], food_res['max(d.grade)'])
			
			db.query(compound_filtered_food_subgroups_sql(compounds, food_group), (err, food_subgroups, fields) => {
				if (err) {console.log(err)};

				console.log('foodsubgroups',food_group)

				food_subgroups.forEach(res => {
					const food_subgroup = res.food_subgroup;
					const min_grade = res['min(d.grade)'];
					const max_grade = res['max(d.grade)'];

					names.push(food_subgroup);

					db.query(compound_filtered_foods_sql(compounds, food_subgroup), (err, food_items, fields) => {
						if (err) {console.log(err)};

						const foods = Array.from(food_items, res => {
							names.push(res.food_name);
							return {
								name: res.food_name,
								id: res.food_id,
								name_scientific: res.name_scientific,
								description: res.description,
								min_grade : res['min(d.grade)'],
								max_grade : res['max(d.grade)'],
								size: 1
							}
						});
						addFoodSubgroupInfo(FILTERED_RESULTS, food_group, food_subgroup, min_grade, max_grade, foods);

						if (hasAllChildren(FILTERED_RESULTS, food_groups.length)) {
							callback(FILTERED_RESULTS, names);
						}							
					});
				});						
			});
		});			
	});
}

// ----------------------------------------------------------------------------------------
// API

module.exports = app => {

	app.get('/getFoodGroups', (req, res) => {
		let result = FOOD_GROUPS_JSON;
   		res.json({json: FOOD_GROUPS_JSON, names: NAMES});
  	});

  	app.get('/getFoodByCompounds', (req, response) => {
  		let compounds = JSON.parse(req.query.compounds);
  		let number = req.query.number;
  
		console.log("FILTER", compounds)
  		getFilteredResults(compounds, function(result, names) {
  			console.log("RESULT SEND TO CLIENT");
  			response.json({json: result, names: names});
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