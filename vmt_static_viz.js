// Generate geographic visualization of daily VMT data
// for the 48 contiguous states of the United States.
//
// Author: Ben Krepp
// Date: August, 2020

// Dimensions of SVG drawing area for map
var width = 975
	height = 610;
var svgMapContainer;

// SVG geo-path generator function
var geoPath = d3.geoPath()
	.projection(vmtCommon.projection);

// GeoJson counties features - populated by generateMap, referenced by symbolizeMap
//
var counties_features;

// One new frame of visualization is rendered every 2000 milliseconds (2 seconds).
var FRAME_INTERVAL = 2000;

// Visualization mode: 'absolute' or 'delta'.
var mode;

// usDateStrToAppDateStr: Utility function to convert a "US-style" date string into
//                        a "yyyy-mm-dd" format date string, the date format used 
//                        internally by this app, and return it.
//
// What we call a "US-style" date string is one in jQueryUI "datepicker" format 'MM d, yy'.
// Note the following about the datepicker format 'MM d, yy':
//     MM - full text of name of month, e.g., "January"
//     d  - day of month, with NO leading zeros
//     yy - four digit (yes, FOUR-digit) year
// ==> There is EXACTLY one space between the month name and the day-of-month.
// ==> There is EXACTLY one space between the comma (',') and the year
//
function usDateStrToAppDateStr(usDateStr) {
	var retval, parts, moStr, dayStr, yrStr, outMo, outDay, outYr;
	var months = {  'January'   : '01',
					'February'  : '02',
					'March'     : '03',
					'April'     : '04',
					'May'       : '05',
					'June'      : '06',
					'July'      : '07',
					'August'    : '08',
					'September' : '09',
					'October'   : '10',
					'November'  : '11',
					'December'  : '12'
	}; 
	
	retval = '';
	parts = usDateStr.split(' ');
	moStr = parts[0];
	dayStr = parts[1].replace(',','');
	yrStr = parts[2];
	outYr = yrStr;
	outMo = months[moStr];
	outDay = (+dayStr < 10) ? '0' + dayStr : dayStr;
	retval = outYr + '-' + outMo + '-' + outDay;
	return retval;
} // usDateStrToAppDateStr()

function configure_datepicker(app_minDate) {
	// N.B. The "month" in JS Date objects is zero-indexed.
	$('#datepicker').datepicker({ dateFormat: 'MM d, yy' });
	$('#datepicker').datepicker({ showOn: "focus" });
	$('#datepicker').datepicker("option", "minDate", app_minDate);
	$('#datepicker').datepicker("option", "maxDate", vmtCommon.maxDate); 
	$('#datepicker').datepicker("option", "defaultDate", app_minDate);
	$('#datepicker').datepicker( "setDate", app_minDate);

	// Define "close" handler for datepicker - fired when a new date is selected
	$('#datepicker').datepicker("option", "onClose", 
		function(dateText, inst) {
			var date;
			if (dateText === "") return;
			date  = usDateStrToAppDateStr(dateText);
			symbolizeMap(date);
	}); // on-close handler for datepicker
} // configure_datepicker()


function vmt_visualization(mode_parm) {
	mode = mode_parm;
	var app_minDate = (mode === 'absolute') ? vmtCommon.minDate_absolute : vmtCommon.minDate_delta;
	configure_datepicker(app_minDate);

	d3.json("json/us_states_48_states_epsg4326.geojson").then(function(states_json_data) {
		// console.log('loaded states json');
		d3.json("json/us_counties_48_states_epsg4326.geojson").then(function(counties_json_data) {
			// console.log('loaded counties json');
			generateMap(states_json_data, counties_json_data);
			symbolizeMap(usDateStrToAppDateStr(app_minDate));
		}); // load of counties GeoJSON
	});// load of states geoJSON
} // vmt_visualization()

function generateMap(states_geojson, counties_geojson) {
	var my_scale, my_labels;
	var states_features = states_geojson.features;
	// We sort counties by FIPS in order to make pseudo-join with VMT data faster.
	counties_features = _.sortBy(counties_geojson.features, function(rec) { return rec.properties['fips']; });
	
	var svg_leg = d3.select('#legend_div')
			.append("svg")
			.attr("id", "legend_svg")
			.attr("height", 50)
			.attr("width", 1200); // was 750
			
	svg_leg.append("g")
		.attr("class", "legendQuant");
		// .attr("transform", "translate(170,20)");

	if (mode === 'absolute') {
		my_scale = vmtCommon.vmt_scale;
		my_labels = vmtCommon.vmt_legend_labels;
	} else if (mode === 'delta') {
		my_scale = vmtCommon.vmt_delta_scale;
		my_labels = vmtCommon.vmt_delta_legend_labels;
	}  else {
		alert('Invalid mode: ' + mode + '. Exiting');
		return;
	}

	var legend = d3.legendColor()
		.labelFormat(d3.format(".0f"))
		.labels(my_labels)
		.shapeWidth(105) // was 120
		.orient('horizontal')
		.scale(my_scale);

	svg_leg.select(".legendQuant")
		.call(legend);

	svgMapContainer = d3.select("#map").append("svg")
		.attr("width", width)
		.attr("height", height)
		.style("border", "2px solid steelblue");

	var counties_map = svgMapContainer.selectAll("path.county")
		.data(counties_features)
		.enter()
			.append("path")
			.attr("class", "county")
			.attr("d", function(d, i) { return geoPath(d); })
			.style("stroke", "black")
			.style("stroke-width", "0.25px")
			.style("fill", "none")
			.append("title")
				.text(function(d,i) { 
						var tmp; 
						tmp = d.properties['co_name'] + ' County, ' + d.properties['st_name'] + '\nFIPS: ' + d.properties['fips'];
						return tmp; 
					});
		
	var states_map = svgMapContainer.selectAll("path.state")
		.data(states_features)
		.enter()
			.append("path")
			.attr("class", "state")
			.attr("d", function(d, i) { return geoPath(d); })
			.style("stroke", "black")
			.style("stroke-width", "1.5px")
			.style("fill", "none")
			.style("opacity", 0.5);

} // generateMap()


function symbolizeMap(date_str) {
	var vmt_csv_fn = "csv/vmt-" + date_str + ".csv";
	// console.log('Initiating load of ' + vmt_csv_fn);
	d3.csv(vmt_csv_fn, function(d) {
	return {
		fips : 			d.fips,
		fips_state:		d.fips_state,
		fips_county:	d.fips_county,
		state:			d.state,
		county:			d.county,
		date:			d.date,
		county_vmt:		+d.county_vmt,
		jan_avg_vmt:	+d.jan_avg_vmt,
		delta:			+d.county_vmt - +d.jan_avg_vmt	// Change in VMT w.r.t. January 2020
		};
	}).then(function(vmt) {
		// console.log('Rendering VMT data for ' + date_str + ' to map.')
		var date_text = vmtCommon.make_date_text(date_str);
		$('#date_field').html(date_text);
		var vmt_recs = _.sortBy(vmt, function(rec) { return rec.fips; });
		var i, result, temp_props, dummy_rec = {};
		for (i = 0; i < counties_features.length; i++) {
			result = _.find(vmt_recs, function(rec) { return rec.fips == counties_features[i].properties['fips']; });
			if (result == undefined) {
				// console.log('FIPS ' + counties_features[i].properties['fips'] + ' not found in VMT data: adding dummy record.');
				// Insert a dummy record for the missing county into vmt_rec.
				temp_props = counties_features[i].properties;
				dummy_rec = {};
				dummy_rec['fips'] = temp_props['fips'];
				dummy_rec['fips_state'] = temp_props['fips'][0] + temp_props['fips'][1];
				dummy_rec['fips_county'] = temp_props['fips'][2] + temp_props['fips'][3] + temp_props['fips'][4];
				dummy_rec['state'] = temp_props['st_name'];
				dummy_rec['county'] = temp_props['co_name'];
				dummy_rec['date'] = date_str;
				dummy_rec['county_vmt'] = vmtCommon.NO_DATA;
				dummy_rec['jan_avg_vmt'] = vmtCommon.NO_DATA;
				dummy_rec['delta'] = vmtCommon.NO_DATA;
				vmt_recs.push(dummy_rec);
			}
		}
		// Re-sort vmt_recs, in case any dummy recs were added:
		vmt_recs = _.sortBy(vmt_recs, function(rec) { return rec.fips; });

		svgMapContainer.selectAll("path.county")
						.transition().duration(1000)
							.style("fill", function(d,i) { 	
								var vmt_rec, data_value, retval;
								vmt_rec = _.find(vmt_recs, function(vmt_rec) { return vmt_rec['fips'] == d.properties['fips']; });
								if (mode === 'absolute') {
									data_value = vmt_rec.county_vmt;
									retval = vmtCommon.vmt_scale(data_value);
								} else {
									// Here: mode must be 'delta'
									data_value = vmt_rec.delta;
									retval = vmtCommon.vmt_delta_scale(data_value);
								}
								return retval;
						});
	}); // load of VMT data for one day
} // symbolizeMap()
