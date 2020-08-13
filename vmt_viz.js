// Generate animated geographic visualization of day-by-day VMT data
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

function vmt_visualization(mode_parm) {
	mode = mode_parm;
	var start_ix = (mode_parm === 'absolute') ? 0 : 30;
	d3.json("json/us_states_48_states_epsg4326.geojson").then(function(states_json_data) {
		// console.log('loaded states json');
		d3.json("json/us_counties_48_states_epsg4326.geojson").then(function(counties_json_data) {
			// console.log('loaded counties json');
			generateMap(states_json_data, counties_json_data);
			symbolizeMap(start_ix);
		});
	});
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


function symbolizeMap(date_ix) {
	var date_str = vmtCommon.all_dates[date_ix];
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
	}).then(function() {
		var tid = setTimeout(
					function() {
						if (date_ix < vmtCommon.all_dates.length - 1) {
							symbolizeMap(date_ix+1);
						}
					}, 
					FRAME_INTERVAL);
	});
} // symbolizeMap()
