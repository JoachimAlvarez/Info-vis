// Helper Functions
const hideElement = el => el.style.display = "none";
const showElement = el => el.style.display = "block";



// ------------ FILTER MODAL ------------
var modal = document.getElementById("filterModal");

var FILTERS = [];

$('#applyFilter').on('click', e => {  
  hideElement(modal)
  let compounds = [];

  $.each($("input[name='compound']:checked"), function() {
      compounds.push($(this).val())
  });
  console.log(compounds)
/*
  $.ajax({
  type: 'GET',
  contentType: 'application/json',
  url: 'http://localhost:4000/getFoodGroups',
  success: data => {
    DATA = data.json;
    DrawVisualisation(data.json, data.names)
  },
  error: (xhr, status, error) => {
    console.log(error)
  },

});
*/

  e.preventDefault();
});
$('#filterButton').on('click', e => {  
  showElement(modal)
  e.preventDefault();
});
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
// When the user clicks on <span> (x), close the modal
span.onclick = e => {
  hideElement(modal)
  e.preventDefault();
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = e => {
  if (e.target == modal) {
    hideElement(modal)
  }
}

// ----------------------------------
// Instructions

$("input[name='setting']").change(function() {
  const val = $(this).val();
  var element = document.getElementById("instructionsSideBar");
  var info_element = document.getElementById("item_info");
  if (val === 'true') {
  	showElement(element);
    info_element.style.height = '350px';
  }
  else {
  	hideElement(element)
    info_element.style.height = '100%';
  }
});


let instr_busy = false;
function updateCurrentAction(d) {
  var name = d.data.name;
  $('#hover_action').text('see information about: '+name);
  if ((CURRENT_DEPTH-1) === d.depth) {
    $('#click_action').text('go Back to '+name);
  }
  else {
    $('#click_action').text('see subgroups of '+name);
  }
  
  var str_hover = "HOVER here to see information about: "+name;
  var str_subgroups = "";
  //var group_children = d.data.children;
  //group_children.forEach(child => { str_subgroups = str_subgroups + child.name + ', ' });
  var str_click = "CLICK here to see information about: "+str_subgroups
  $('#curr_actions').append(d.data.name);
}
function blinkHome(blink) {
  if (blink) {
    if (CURRENT_DEPTH === 0) {
      center.attr('fill', 'white');
    }
    else {
      setOpacity(CURRENT_D.parent, 1, 0.2);
    }
  }
  else {
    if (CURRENT_DEPTH === 0) {
      center.attr('fill', 'black');
    }
    else {
      setOpacity(CURRENT_D.parent, 0.2, 0.2);
    }
  }
}
$('#backInstr').on('mouseover', e => {
  if (!instr_busy) {
    setOpacityAll(0.2);
    instr_busy = true;
  //  d3.selectAll("path").style("opacity", 0.2);
    setTimeout(() => {
       blinkHome(true);
       setTimeout(() => {
        blinkHome(false);
        setTimeout(() => {
          blinkHome(true);
          setTimeout(() => {
            blinkHome(false);
            setTimeout(() => {
              blinkHome(true);
              setTimeout(() => {
                blinkHome(false);
              //  d3.selectAll("path").style("opacity", 1);
                clickOn(CURRENT_D.parent)
                updateBreadcrumbs(CURRENT_D);
                updateInformation(CURRENT_D);
                setOpacity(CURRENT_D, 1, 0.2);
                instr_busy = false;
              }, 1000);
            }, 500);
          }, 500);
        }, 500);
      }, 500);
    }, 500);
  }
});
function blinkGroup(blink, child) {
  if (blink) {
    setOpacity(child, 1, 0.2);
  }
  else {
    setOpacity(child, 0.2, 0.2);
  }
}
$('#selectInstr').on('mouseover', e => {
  if (!instr_busy) {
    if (CURRENT_D.children) {
      const child = CURRENT_D.children[1];
      instr_busy = true;
    
      setOpacityAll(0.2);
      setTimeout(() => {
        blinkGroup(true, child);
        setTimeout(() => {
          blinkGroup(false, child);
          setTimeout(() => {
            blinkGroup(true, child);
            setTimeout(() => {
              clickOn(child)
              if (CURRENT_D) {
                updateBreadcrumbs(CURRENT_D);
                updateInformation(CURRENT_D);
              }
              instr_busy = false
            }, 1000);
          }, 500);
        }, 500);
      }, 500);
    }
    else {
      alert('You are at maximum depth, you cannot go deeper in the visualisation');
    }
  }
});
// ----------------------------------
// Color Blindness
let COLOR_BLIND_MODE = false;
let COLOR_BLIND_COLORS = d3.scaleOrdinal(['#a50f15', '#de2d26', '#fb6a4a', '#cfae91', '#08519c', '#3182db', '#6baed6', '#636363', '#969696', '#cccccc']);
let NORMAL_COLORS = d3.scaleOrdinal(d3.schemeCategory10);
let color = d3.scaleOrdinal(d3.schemeCategory10);
$("input[name='colorBlind']").change(function() {
  const val = $(this).val()
  if (val === 'true') {
    COLOR_BLIND_MODE = true;
    color = COLOR_BLIND_COLORS;
  }
  else {
    COLOR_BLIND_MODE = false;
    color = NORMAL_COLORS;
  }
  redraw();
});
function redraw() {
  $("#svg-div").empty();
  svg = d3.select("#svg-div").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    .on('click', clickOn);
  VisualiseData(DATA);
}
// ----------------------------------
// Search
let NAMES = [];
$('#search').submit(e => {
  const name = e.currentTarget[0].value;
  var d = false;
  svg.selectAll("path")
      .filter(node => {
        if (node.data.name === name) {
          d = node;
        }
      });
  if (d) {
    var anc = getAncestors(d);
    clickOn(anc[1]);
    updateInformation(d);
    updateBreadcrumbs(d);
    setOpacity(d, 1, 0.2);
  }
  else {
    alert("This item does not exist, please pick one from the list");
  }
  e.preventDefault();
});
function InitialiseAutocomplete(names) {
  var datalist = $('#datalist');
  names.forEach(name => {
    const option = '<option value="'+name+'"">';
    datalist.append(option)
  })
}
// -----------------------------------
// Init constants and helper functions
const formatNumber = d3.format(',d');
const width = $('#svg-div').width();// window.innerWidth;
const height = (window.innerHeight *80 /100); //$('#svg-div').height();//;
const radius = (Math.min(width, height) / 2) - 5;
const x = d3.scaleLinear().range([0, 2 * Math.PI]).clamp(true);
const y = d3.scaleSqrt().range([radius*.1, radius]);
const partition = d3.partition();
const arc = d3.arc()
    .startAngle(d => x(d.x0))
    .endAngle(d => x(d.x1))
    .innerRadius(d => Math.max(0, y(d.y0)))
    .outerRadius(d => Math.max(0, y(d.y1)))
const middleArcLine = d => {
    const halfPi = Math.PI/2;
    const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
    const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
    const middleAngle = (angles[1] + angles[0]) / 2;
    const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
    if (invertDirection) { angles.reverse(); }
    const path = d3.path();
    path.arc(0, 0, r, angles[0], angles[1], invertDirection);
    return path.toString();
};
const textFits = d => {
    const CHAR_SPACE = 6;
    const deltaAngle = x(d.x1) - x(d.x0);
    const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2); // Changed
    const perimeter = r * deltaAngle;
    return d.data.name.length * CHAR_SPACE < perimeter;
};
// ---------------------------------------------------------------------
// This is the Visualisation
var svg = d3.select("#svg-div")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    .on('click', clickOn);
//d3.select("#container").on("mouseleave", d => mouseLeave(d, true));
var center = svg.append("circle")
      .attr("r", radius / 10)
      .on("click", function(d) {});
  center.append("title")
      .text("Zoom Out");
// ---------------------------------------------------------------------
// Side Information
var Depths = { 0: 'Foods', 1: 'Food Groups', 2: 'Food Subgroups', 3: 'Food'}
const DEPTH = Object.keys(Depths).length;
function gradesSpan(min, max) {
  const solid_star = '<i class="fas fa-star"></i>';
  const empty_star = '<i class="far fa-star"></i>';
  const half_star  = '<i class="fas fa-star-half-alt"></i>';
  let html = '<span>';
  for (i = 0; i < Math.floor(min); i ++) {
    html += solid_star;
  }
  if (min % 1 != 0) {
    html += half_star;
  }
  for (i = 0; i < (5-Math.ceil(min)); i++) {
    html += empty_star;
  }
  html += ' - ';
  for (i = 0; i < Math.floor(max); i ++) {
    html += solid_star;
  }
  if (max % 1 != 0) {
    html += half_star;
  }
  for (i = 0; i < (5-Math.ceil(max)); i++) {
    html += empty_star;
  }
  
  html += '</span>';
  return html;
}
function showFoodInformation(d) {
  const name_scientific = d.data.name_scientific;
  const description = d.data.description || "Description not available";
  const parent_name = d.parent.data.name;
  const min_grade = d.data.min_grade;
  const max_grade = d.data.max_grade;
  var div = document.createElement('div');
  let html = '';
  if (name_scientific) {
    html += '<p style="text-align: center;"><b>Scientific Name:</b> '+name_scientific+'</p>'
  }
  html += '<p><b>Parent Group: </b>'+parent_name+'</p>';
  if (min_grade && max_grade) {
  	html += '<p><b>Grade Range: </b>'+gradesSpan(min_grade,max_grade)+'</p>';
  }
  else {
  	html += '<p><b>Grade Range: </b> No information </p>';
  }
  
  html += '<p>'+description+'</p>';
  div.innerHTML = html;
  document.getElementById('info').appendChild(div);
}
function showDishInformation(d) {
}
function showGroupInformation(d) {
  var info_div = $('#info');
  var group_name = d.data.name;
  var group_parent = group_name || d.parent.data.name;
  var grade = d.data.grade;
  var group_children = d.data.children || ""; // Bug that appears until foods are added to the system
  const min_grade = d.data.min_grade;
  const max_grade = d.data.max_grade;
  var str = "";
  group_children.forEach(child => { str = str + child.name + ', ' });
  str = str.substring(0, str.length - 2);
  var div = document.createElement('div');
  let html = "";
  html += '<p><b>Grade Rage: </b>'+gradesSpan(min_grade,max_grade)+'</p>';
  html += '<p><b>Click here to find subgroups such as:</b> '+str+'</p>';
  
  div.innerHTML = html;
 
  document.getElementById('info').appendChild(div);
}
function showHomeInformation(d) {
  var info_div = $('#info');
  var group_name = d.data.name;
  var div = document.createElement('div');
  var str = "";
  var group_children = d.data.children || "";
  group_children.forEach(child => { str = str + child.name + ', ' });
  str = str.substring(0, str.length - 2);
  let html = '<p><b>Click here to find subgroups such as:</b> '+str+'</p>';
  div.innerHTML = html;
  document.getElementById('info').appendChild(div);
}
function clearInformation(d) {
  var info_div = $('#info');
  let name = $('#item_name');
  
  if (d.depth === DEPTH) {
    name[0].innerText = "";
  }
  info_div.empty();
}
function updateInformation(d) {
  clearInformation(d);
  const name = d.data.name;
  let name_div = $('#item_name');
  name_div[0].innerText = name;
  switch(d.depth) {
    case 0: showHomeInformation(d); 
      break;
    case 1: showGroupInformation(d); 
      break;
    case 2: showGroupInformation(d); 
      break;
    case 3: showFoodInformation(d); 
      break;
    case 4: showDishInformation(d); 
      break;
    default: console.log("Error: unhandled depth", d);
  }
}
// ---------------------------------------------------------------------
// Clickable Breadcrumbs
const clearBreadCrumbs = () => d3.select('.breadcrumbs').selectAll('.breadcrumb').remove();
  
function updateBreadcrumbs(d) {
    clearBreadCrumbs();
    const crumbContainer = d3.select('.breadcrumbs');
    const anc = getAncestors(d);
    // Add First: 'Foods'
    crumbContainer.append('span')
        .classed('breadcrumb', true)
        .text(anc[0].data.name)
        .on("click", (_, a ,f) => { clickOn(anc[0]) });
    // add rest
    for (i = 1; i < anc.length; i++) {
      const n = anc[i];
      crumbContainer.append('span')
        .classed('breadcrumb', true)
        .text("  >  "+n.data.name)
        .on("click", (_, a ,f) => { 
        	clickOn(n);
        	updateInformation(n);
        	updateCurrentAction(n)
        	updateBreadcrumbs(n);
        	setOpacity(n, 1, 0.2)
        });
    } 
}
function getAncestors(node) {
  var path = [];
  var current = node;
  while (current.parent) {
    path.push(current);
    current = current.parent;
  }
  path.push(current)
  path.reverse();
  return path;
}
// ---------------------------------------------------------------------
// Opacity
const setOpacityAll = opacity => d3.selectAll("path").style("opacity", opacity);

function setOpacity(d, op_highlight, op_dim) {
  var sequenceArray = getAncestors(d);
  d3.selectAll("path").style("opacity", op_dim);
  svg.selectAll("path")
      .filter(node => { return (sequenceArray.indexOf(node) >= 0)})
      .style("opacity", op_highlight);
}
// ---------------------------------------------------------------------
// UI listeners
function mouseOver(d) {
  updateBreadcrumbs(d);
  updateInformation(d);
  setOpacity(d, 1, 0.3);
  updateCurrentAction(d);
}
function mouseLeave(d, segment=false) { 
}
function clickOn(d) {
  if (d) { 
    CURRENT_D = d;
    const transition = svg.transition()
        .duration(750)
        .tween('scale', () => {
            const xd = d3.interpolate(x.domain(), [d.x0, d.x1]);
            const yd = d3.interpolate(y.domain(), [d.y0, 1]);
            return t => { x.domain(xd(t)); y.domain(yd(t)); };
        });
    transition.selectAll('path.main-arc').attrTween('d', d => () => arc(d));
    transition.selectAll('path.hidden-arc').attrTween('d', d => () => middleArcLine(d));
    
    const depth = d.depth;
    CURRENT_DEPTH = depth;
    
    transition.selectAll('path.main-arc').attr('display', d => (depth+3 > d.depth) ? null : 'none');
    transition.selectAll('path.hidden-arc').attr('display', d => (depth+3>d.depth) ? null : 'none');
    transition.selectAll('text').attr('display', d => (depth+3>d.depth) ? null : 'none');
    transition.selectAll('text').attrTween('display', d => () => textFits(d) ? null : 'none');
}
}
// ----------------------------------------------------------------------
// Sunburst
var CURRENT_DEPTH = 0;
var CURRENT_D = null;
function VisualiseData(data) {
  const root = d3.hierarchy(data)
      .sum(d => d.size);
  const slice = svg.selectAll('g.slice')
      .data(partition(root).descendants());
  slice.exit().remove();
  const newSlice = slice.enter()
      .append('g').attr('class', 'slice')
      .on('mouseover', mouseOver)
      .on('click', d => { d3.event.stopPropagation(); clickOn(d) })
      //.attr('display', d => (CURRENT_DEPTH+2>=d.depth) ? null : 'none');
  newSlice.append('title')
      .text(d => d.data.name);
  newSlice.append('path')
      .attr('class', 'main-arc')
      .style('fill', d => color((d.children ? d : d.parent).data.name)) // todo
      .attr('d', arc);
  newSlice.append('path')
      .attr('class', 'hidden-arc')
      .attr('id', (_, i) => `hiddenArc${i}`)
      .attr('d', middleArcLine);
  const text = newSlice.append('text')
      .attr('display', d => textFits(d) ? null : 'none');
  text.append('textPath')
      .attr('startOffset','50%')
      .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
      .text(d => d.data.name);
  var home = svg.selectAll("path")._groups[0][0].__data__;
  CURRENT_D = home;
  updateInformation(CURRENT_D);
  updateBreadcrumbs(CURRENT_D);
  clickOn(home);
}
/*
var partitioned_data = partition.nodes(d3.hierarchy(DATA)).slice(1)
function filter_min_arc_size_text(d, i) {return (d.dx*d.depth*radius/1)>14};
function isRotated(d) {
    var rotation = (d.x + d.dx / 2) * 180 / Math.PI - 90;
    return rotation > 90 ? true : false
}
var texts = svg.selectAll("text")
      .data(partitioned_data)
      .enter()
      .append("text")
      .filter(filter_min_arc_size_text)
      .attr("transform", d => {
          var r = computeTextRotation(d);
          return "rotate(" + r.global + ")"
            + "translate(" + radius / 3. * d.depth + ")"
            + "rotate(" + -r.correction + ")";
      })
      .style("font-weight", "bold")
      .style("text-anchor", "middle")
      .attr("dx", d => {return isRotated(d) ? "-85" : "85"}) //margin
      .attr("dy", ".35em") // vertical-align
      .on("click", clickOn)
      .text( (d,i) => {return d.name})
*/
// ---------------------------------------------------------------------
// Fetch the data and show the visualisation
function DrawVisualisation(data, names) {
  InitialiseAutocomplete(names);
  VisualiseData(data);
}

let DATA = {};
$.ajax({
  type: 'GET',
  contentType: 'application/json',
  url: 'http://localhost:4000/getFoodGroups',
  success: data => {
    DATA = data.json;
    console.log(DATA)
    DrawVisualisation(data.json, data.names)
  },
  error: (xhr, status, error) => {
    console.log(error)
  },
});