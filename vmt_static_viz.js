// Value to indicate no VMT data record for {date, county} in data supplied by data provider.
var NO_DATA = -300000000;

// Dimensions of SVG drawing area for map
var width = 975
	height = 610;
var svgMapContainer;

// Projection for GeoJSON data
var projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);
// SVG geo-path generator function
var geoPath = d3.geoPath()
	.projection(projection);

// GeoJson counties features - populated by generateMap, referenced by symbolizeMap
//
var counties_features;

// Threshold logarithmic scale for rendering VMT data.
// 5-class diverging scale, inverted, with initial 'no data' step added.
// Range values from colorbrewer2.org: https://colorbrewer2.org/#type=diverging&scheme=Spectral&n=5
var vmt_scale = d3.scaleThreshold()
					.domain([0, 100000, 1000000, 10000000, 100000000, Infinity])
					.range(['gray', "#2b83ba", "#abdda4", "#ffffbf", "#fdae61", "#d7191c"]); 
// VMT Legend labels 
var vmt_legend_labels = ['No Data', '100,000', '1,000,000', '10,000,000', '100,000,000', '>100,000,000' ]

// Threshold logarithmic scale for rendering the DELTA of VMT values beween January 2020 and a given date.
// 9-class diverging scale, inverted, with initial 'no data' step added.
// Range values from colorbrewer2.org: https://colorbrewer2.org/#type=diverging&scheme=Spectral&n=9
var vmt_delta_scale = d3.scaleThreshold()
					.domain([-200000000, 
					         -100000000, -10000000, 1000000, -1000000,
                       	     100000, 1000000, 10000000, 100000000, Infinity])
					.range(['gray', 
					        '#3288bd', '#66c2a5', '#abdda4', '#e6f598', 
							'#ffffbf', '#fee08b', '#fdae61', '#d53e4f']);
// Delta VMT Legend labels 
var vmt_delta_legend_labels = ['No Data', 
							   '>-100,000,000', '-10,000,000', '-1,000,000', '-100,000',
                               '+100,000', '+1,000,000', '+10,000,000', '>+100,000,000'];

// Dates for which we have VMT data
var all_daytz = [   
                '2020-01-01', '2020-01-02', '2020-01-03', '2020-01-04', '2020-01-05', '2020-01-06', '2020-01-07', 
                '2020-01-08', '2020-01-09', '2020-01-10', '2020-01-11', '2020-01-12', '2020-01-13', '2020-01-14', 
                '2020-01-15', '2020-01-16', '2020-01-17', '2020-01-18', '2020-01-19', '2020-01-20', '2020-01-21', 
                '2020-01-22', '2020-01-23', '2020-01-24', '2020-01-25', '2020-01-26', '2020-01-27', '2020-01-28',
                '2020-01-30', '2020-01-31',

                '2020-02-01', '2020-02-02', '2020-02-03', '2020-02-04', '2020-02-05', '2020-02-06', '2020-02-07', 
                '2020-02-08', '2020-02-09', '2020-02-10', '2020-02-11', '2020-02-12', '2020-02-13', '2020-02-14', 
                '2020-02-15', '2020-02-16', '2020-02-17', '2020-02-18', '2020-02-19', '2020-02-20', '2020-02-21', 
                '2020-02-22', '2020-02-23', '2020-02-24', '2020-02-25', '2020-02-26', '2020-02-27', '2020-02-28',

                '2020-03-01', '2020-03-02', '2020-03-03', '2020-03-04', '2020-03-05', '2020-03-06', '2020-03-07', 
                '2020-03-08', '2020-03-09', '2020-03-10', '2020-03-11', '2020-03-12', '2020-03-13', '2020-03-14', 
                '2020-03-15', '2020-03-16', '2020-03-17', '2020-03-18', '2020-03-19', '2020-03-20', '2020-03-21', 
                '2020-03-22', '2020-03-23', '2020-03-24', '2020-03-25', '2020-03-26', '2020-03-27', '2020-03-28',
                '2020-03-30', '2020-03-31',
                '2020-04-01', '2020-04-02', '2020-04-03', '2020-04-04', '2020-04-05', '2020-04-06', '2020-04-07', 
                '2020-04-08', '2020-04-09', '2020-04-10', '2020-04-11', '2020-04-12', '2020-04-13', '2020-04-14', 
                '2020-04-15', '2020-04-16', '2020-04-17', '2020-04-18', '2020-04-19', '2020-04-20', '2020-04-21', 
                '2020-04-22', '2020-04-23', '2020-04-24', '2020-04-25', '2020-04-26', '2020-04-27', '2020-04-28', 
                '2020-04-29', '2020-04-30', 

                '2020-05-01', '2020-05-02', '2020-05-03', '2020-05-04', '2020-05-05', '2020-05-06', '2020-05-07', 
                '2020-05-08', '2020-05-09', '2020-05-10', '2020-05-11', '2020-05-12', '2020-05-13', '2020-05-14', 
                '2020-05-15', '2020-05-16', '2020-05-17', '2020-05-18', '2020-05-19', '2020-05-20', '2020-05-21', 
                '2020-05-22', '2020-05-23', '2020-05-24', '2020-05-25', '2020-05-26', '2020-05-27', '2020-05-28', 
                '2020-05-29', '2020-05-30', '2020-05-31', 

                '2020-06-01', '2020-06-02', '2020-06-03', '2020-06-04', '2020-06-05', '2020-06-06', '2020-06-07', 
                '2020-06-08', '2020-06-09', '2020-06-10', '2020-06-11', '2020-06-12', '2020-06-13', '2020-06-14', 
                '2020-06-15', '2020-06-16', '2020-06-17', '2020-06-18', '2020-06-19', '2020-06-20', '2020-06-21', 
                '2020-06-22', '2020-06-23', '2020-06-24', '2020-06-25', '2020-06-26', '2020-06-27', '2020-06-28',
                '2020-06-29', '2020-06-30',
                
                '2020-07-01', '2020-07-02', '2020-07-03', '2020-07-04', '2020-07-05', '2020-07-06', '2020-07-07', 
                '2020-07-08', '2020-07-09', '2020-07-10', '2020-07-11', '2020-07-12', '2020-07-13', '2020-07-14', 
                '2020-07-15', '2020-07-16', '2020-07-17', '2020-07-18', '2020-07-19', '2020-07-20', '2020-07-21', 
                '2020-07-22', '2020-07-23', '2020-07-24', '2020-07-25', '2020-07-26', '2020-07-27', '2020-07-28'
];

// Unabashed hack
var minDate_absolute = 'January 1, 2020',
    minDate_delta = 'February 1, 2020',
	maxDate = 'July 28, 2020';
				
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
	$('#datepicker').datepicker("option", "maxDate", maxDate); 
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
	var app_minDate = (mode === 'absolute') ? minDate_absolute : minDate_delta;
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
		my_scale = vmt_scale;
		my_labels = vmt_legend_labels;
	} else if (mode === 'delta') {
		my_scale = vmt_delta_scale;
		my_labels = vmt_delta_legend_labels;
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

// Utility function to map a date string in yyyy-mm-dd format
// into to one in conventional US-style textual format
function make_date_text(date) {
	var parts = date.split('-');
	var year = parts[0]
	var month_num = parseInt(parts[1],10);
	var day = parseInt(parts[2],10);
	var months = ['January', 'February', 'March', 'April', 'May', 'June',
	              'July', 'August', 'September', 'October', 'November', 'December'];
	var month = months[month_num-1]; // Recall 0-based array indexing
	return month + ' ' + day + ', ' + year;
} // make_date_text()

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
		var date_text = make_date_text(date_str);
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
				dummy_rec['county_vmt'] = NO_DATA;
				dummy_rec['jan_avg_vmt'] = NO_DATA;
				dummy_rec['delta'] = NO_DATA;
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
									retval = vmt_scale(data_value);
								} else {
									// Here: mode must be 'delta'
									data_value = vmt_rec.delta;
									retval = vmt_delta_scale(data_value);
								}
								return retval;
						});
	}); // load of VMT data for one day
} // symbolizeMap()
