function popup(url) {
	var popupWindow = window.open(url,'popUpWindow',
		'height=700,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes');
};

function vmt_visualization() {
	// $('#about_button').hide();
	// $('#about_button').click(function() { popup("about.html"); });

	d3.json("json/us_counties_epsg4326.geojson").then(function(json_data) {
		console.log('loaded json');
		d3.csv("csv/vmt_data.csv").then(function(csv_data) {
			console.log('loaded csv');
			generateMap(json_data, csv_data);
		});
	});
}

function generateMap(counties_geojson, vmt_data_csv) {	
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
		
	var map = svgContainer.selectAll("path")
		.data(counties.features)
		.enter()
		.append("path")
		.attr("d", function(d, i) { return geoPath(d); })
		.style("stroke", "black")
		.style("stroke-width", "0.25px")
		.style("fill", "white");


	//setSymbology();
	// generateLegend(popChgScale, 'legend', 'Population Change (percent)');
	
	// $('#about_button').show();
	

	
	
} // generateMap
