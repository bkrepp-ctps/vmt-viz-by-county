# Script to massage raw county-by-county VMT data into a format suitable for the viz app.

import csv

root_dir = r'c:/Users/ben_k/work_stuff/vmt-viz-by-county/'

in_fn = root_dir + 'csv/county_vmt_download_update2_7_1.csv'

out_fn = root_dir + 'csv/vmt_data.csv'
out_csv_header = 'fips,fips_state,fips_county,state,county,date,county_vmt,jan_avg_vmt\n'
out_f = open(out_fn, 'w')
out_f.write(out_csv_header)

with open(in_fn, newline='') as in_csvfile:
    reader = csv.DictReader(in_csvfile)
    for row in reader:
        #
        raw_state_fips = row['statefp10']
        state_fips = ''
        if (len(raw_state_fips) == 1):
            state_fips = '0' + raw_state_fips
        else:
            state_fips = raw_state_fips
        # end_if
        #
        raw_county_fips = row['countyfp10']
        if (len(raw_county_fips) == 1):
            county_fips = '00' + raw_county_fips
        elif (len(raw_county_fips) == 2):
             county_fips = '0' + raw_county_fips
        else:
            county_fips = raw_county_fips
        # end_if
        #
        full_fips = state_fips + county_fips
        #
        state = row['state_name']
        county  = row['county_name']
        county_vmt = row['county_vmt']
        dayte = row['ref_dt']
        jan_avg_vmt = row['jan_avg_vmt']
        #
        out_str = full_fips + ',' + state_fips + ',' + county_fips + ',' + state + ',' + county + ','
        out_str += dayte + ',' + county_vmt + ',' + jan_avg_vmt + '\n'
        # outf.write(out_str)
        out_f.write(out_str)
    # end_for
# end_with
out_f.close()
