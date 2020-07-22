function popup(url) {
	var popupWindow = window.open(url,'popUpWindow',
		'height=700,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes');
};

function vmt_visualization() {
	// $('#about_button').hide();
	// $('#about_button').click(function() { popup("about.html"); });

	d3.json("json/us_states_epsg4326.geojson").then(function(states_json_data) {
		console.log('loaded states json');
		d3.json("json/us_counties_epsg4326.geojson").then(function(counties_json_data) {
			console.log('loaded counties json');
			d3.csv("csv/vmt_data.csv").then(function(csv_data) {
				console.log('loaded csv');
				generateMap(states_json_data, counties_json_data, csv_data);
			});
		});
	});
}

function generateMap(states_geojson, counties_geojson, vmt_data_csv) {	
	var states = states_geojson;
	var counties = counties_geojson;
	var vmt = vmt_data_csv;
	
	// var counties = topojson.feature(us, us.objects.counties, (a, b) => a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0));
	// var states = topojson.feature(us, us.objects.states, (a, b) => a !== b);
	// var nation = topojson.feature(us, us.objects.nation);
	
	var width = 975
		height = 610;
		
	var svgContainer = d3.select("#map").append("svg")
		.attr("width", width)
		.attr("height", height)
		.style("border", "2px solid steelblue");
		
	var projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);
		
	var geoPath = d3.geoPath()
		.projection(projection);
		
	var counties_map = svgContainer.selectAll("path.county")
		.data(counties.features)
		.enter()
			.append("path")
			.attr("class", "county")
			.attr("d", function(d, i) { return geoPath(d); })
			.style("stroke", "black")
			.style("stroke-width", "0.25px")
			.style("fill", "none");
		
	var states_map = svgContainer.selectAll("path.state")
		.data(states.features)
		.enter()
			.append("path")
			.attr("class", "state")
			.attr("d", function(d, i) { return geoPath(d); })
			.style("stroke", "black")
			.style("stroke-width", "1.5px")
			.style("fill", "none")
			.style("opacity", 0.5);
		


	//setSymbology();
	// generateLegend(popChgScale, 'legend', 'Population Change (percent)');
	
	// $('#about_button').show();

} // generateMap
