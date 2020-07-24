// Value to indicate no VMT data record for {date, county} in data supplied by data provider.
var NO_DATA = -9999;

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

// Legend labels 
var legend_labels = ['No Data', '100,000', '1,000,000', '10,000,000', '100,000,000', '>100,000,000' ]

// Dates for which we have VMT data
var all_daytz = [   '2020-03-01', '2020-03-02', '2020-03-03', '2020-03-04', '2020-03-05', '2020-03-06', '2020-03-07', 
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
                '2020-05-29', '2020-05-30', '2020-05-31', '2020-06-01', '2020-06-02', '2020-06-03', '2020-06-04', 
                '2020-06-05', '2020-06-06', '2020-06-07', '2020-06-08', '2020-06-09', '2020-06-10', '2020-06-11', 
                '2020-06-12', '2020-06-13', '2020-06-14', '2020-06-15', '2020-06-16', '2020-06-17', '2020-06-18', 
                '2020-06-19', '2020-06-20', '2020-06-21', '2020-06-22', '2020-06-23', '2020-06-24', '2020-06-25', 
                '2020-06-26', '2020-06-27', '2020-06-28' ];
				
// One new frame of visualization is rendered every 2000 milliseconds (2 seconds).
var FRAME_INTERVAL = 2000;


function vmt_visualization() {
	d3.json("json/us_states_48_states_epsg4326.geojson").then(function(states_json_data) {
		// console.log('loaded states json');
		d3.json("json/us_counties_48_states_epsg4326.geojson").then(function(counties_json_data) {
			// console.log('loaded counties json');
			symbolizeMap(0);
			generateMap(states_json_data, counties_json_data);
			// var tid  = setTimeout(function() { symbolizeMap(0); }, 100);
		});
	});
} // vmt_visualization()

function generateMap(states_geojson, counties_geojson) {	
	var states_features = states_geojson.features;
	// We sort counties by FIPS in order to make pseudo-join with VMT data faster.
	counties_features = _.sortBy(counties_geojson.features, function(rec) { return rec.properties['fips']; });
	
	var svg_leg = d3.select('#legend_div')
			.append("svg")
			.attr("id", "legend_svg")
			.attr("height", 50)
			.attr("width", 750);
			
	svg_leg.append("g")
		.attr("class", "legendQuant");
		// .attr("transform", "translate(170,20)");
		
	var legend = d3.legendColor()
		.labelFormat(d3.format(".0f"))
		.labels(legend_labels)
		.shapeWidth(120)
		.orient('horizontal')
		.scale(vmt_scale);
		
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
						tmp = d.properties['co_name'] + ' County, ' + d.properties['st_name'];
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
		
	var _DEBUG_HOOK = 0;
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

function symbolizeMap(date_ix) {
	var date_str = all_daytz[date_ix];
	var vmt_csv_fn = "csv/vmt-" + date_str + ".csv";
	// console.log('Initiating load of ' + vmt_csv_fn);
	d3.csv(vmt_csv_fn, function(d) {
	return {
		fips : 	d.fips,
		fips_state:	d.fips_state,
		fips_county:	d.fips_county,
		state:			d.state,
		county:			d.county,
		date:			d.date,
		county_vmt:		+d.county_vmt,
		jan_avg_vmt:	+d.jan_avg_vmt
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
				vmt_recs.push(dummy_rec);
			}
		}
		// Re-sort vmt_recs, in case any dummy recs were added:
		vmt_recs = _.sortBy(vmt_recs, function(rec) { return rec.fips; });

		svgMapContainer.selectAll("path.county")
						.transition().duration(1000)
							.style("fill", function(d,i) { 	
								var vmt_rec, vmt, retval;
								vmt_rec = _.find(vmt_recs, function(vmt_rec) { return vmt_rec['fips'] == d.properties['fips']; });
								vmt = vmt_rec.county_vmt;
								retval = vmt_scale(vmt);
								return retval;
						});
	}).then(function() {
		var tid = setTimeout(
					function() {
						if (date_ix < all_daytz.length - 1) {
							symbolizeMap(date_ix+1);
						}
					}, 
					FRAME_INTERVAL);
	});
} // symbolizeMap()
