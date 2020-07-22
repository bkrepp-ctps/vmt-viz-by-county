var NO_DATA = -9999;

function vmt_visualization() {
	d3.json("json/us_states_48_states_epsg4326.geojson").then(function(states_json_data) {
		console.log('loaded states json');
		d3.json("json/us_counties_48_states_epsg4326.geojson").then(function(counties_json_data) {
			console.log('loaded counties json');
			d3.csv("csv/vmt_data.csv").then(function(csv_data) {
				console.log('loaded csv');
				generateMap(states_json_data, counties_json_data, csv_data);
			});
		});
	});
}

function generateMap(states_geojson, counties_geojson, vmt_data_csv) {	
	var states_features = states_geojson.features;
	// We sort counties by FIPS in order to make joining with VMT data simpler/easier.
	var counties_features = _.sortBy(counties_geojson.features, function(rec) { return rec.properties['fips']; });
	var vmt = vmt_data_csv;

	var width = 975
		height = 610;
		
	var svgContainer = d3.select("#map").append("svg")
		.attr("width", width)
		.attr("height", height)
		.style("border", "2px solid steelblue");
		
	var projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);
		
	var geoPath = d3.geoPath()
		.projection(projection);
	
	var date_str = '3/16/2020';
	var vmt_recs = _.filter(vmt, function(rec) { return rec.date == date_str; });
	vmt_recs = _.sortBy(vmt_recs, function(rec) { return rec.fips; });
	
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
			vmt_recs.push(dummy_rec);
		}
	}
	// Re-sort vmt_recs, in case any dummy recs were added:
	vmt_recs = _.sortBy(vmt_recs, function(rec) { return rec.fips; });
	
	// TEMP SANITY CHECK
/* 
	for (i = 0; i < counties_features.length; i++) {
		result = _.find(vmt_recs, function(rec) { return rec.fips == counties_features[i].properties['fips']; });
		if (result == undefined) {
			console.log('FIPS ' + counties_features[i].properties['fips'] + ' STILL not found in vmt data.');
		}
	}
*/
	
	var counties_map = svgContainer.selectAll("path.county")
		.data(counties_features)
		.enter()
			.append("path")
			.attr("class", "county")
			.attr("d", function(d, i) { return geoPath(d); })
			.style("stroke", "black")
			.style("stroke-width", "0.25px")
			.style("fill", function(d,i) {
				var retval;
				var vmt_rec = _.find(vmt_recs, function(vmt_rec) { return vmt_rec['fips'] == d.properties['fips']; });
				var vmt = +vmt_rec.county_vmt;
				if (vmt < 0) {
					retval = "gray";
				} else if (vmt < 100000) {
					retval = "#2b83ba";
				} else if (vmt < 1000000) {
					retval = "#abdda4";
				} else if (vmt < 10000000) {
					retval = "#ffffbf";
				} else if (vmt < 100000000) {
					retval  = "#fdae61";
				} else {
					retval = "#d7191c";
				}
				return retval;
			})
			.append("title")
				.text(function(d,i) { 
						var tmp; 
						tmp = d.properties['co_name'] + ' County, ' + d.properties['st_name'];
						return tmp; 
					});
		
	var states_map = svgContainer.selectAll("path.state")
		.data(states_features)
		.enter()
			.append("path")
			.attr("class", "state")
			.attr("d", function(d, i) { return geoPath(d); })
			.style("stroke", "black")
			.style("stroke-width", "1.5px")
			.style("fill", "none")
			.style("opacity", 0.5);
		
	var _DEBUG_HOOK = 0;
} // generateMap
