# vmt-viz-by-county
## Overview
Repository for app to visualize county-by-county VMT (vehicle-miles-traveled) data.

The data currently available is for the 48 contiguous states from January 1, 2020 to July 31, 2020.

The page __vmt_static.html__ presents a visualization of VMT on a selected date.

The page __vmt.html__ presents an animated visualization of VMT as it changes from the first to the last
date for which data is available.

The page __vmt_static_delta.html__ presents a visualization of the _difference_ in VMT between 
that on a selected date and the average VMT in January, 2020.

The page __vmt_change.html__ presents an animated visualization of the _difference_ in VMT 
between February 1, 2020 and the last date for which data is availalble and the average VMT
in January, 2020.

## Data Sources
* Raw data for state and county boundaries, in GeoJSON format, from https://eric.clst.org/tech/usgeojson/
* Raw data for FIPS ID of each county, in CSV format,  from https://gist.github.com/dantonnoriega/bf1acd2290e15b91e6710b6fd3be0a53
* County-by-county VMT data from proprietary data source

## Dependencies
This application depends upon the following libraries:
* jQuery version 3.5.1
* lodash version 4.17.15
* d3 version 5.16.0
* d3-legend version 2.25.6 - See the [d3-legend website](https://d3-legend.susielu.com/)
