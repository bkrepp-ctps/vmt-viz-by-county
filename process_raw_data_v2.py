# Script to massage raw county-by-county VMT data into a format suitable for the viz app.
# This script is based on the format of the data delivered after June 28, 2020.

import csv

root_dir = r'c:/Users/ben_k/work_stuff/vmt-viz-by-county/'

# Step 0
# Load dict of January 2020 average VMT, keyed by fips.
in_fn0 = root_dir + '/csv/county_vmt_january_average.csv'
jan_vmt = {}
with open(in_fn0, newline='') as in_csvfile0:
    reader = csv.DictReader(in_csvfile0)
    for row in reader:
        key = row['fips']
        value = row['jan_avg_vmt']
        s = key + ' ' + value
        print(s)
        jan_vmt[key] = value
    # end_for
#end_with

# Step 1
# Read raw input CSV file, and produce output CSV file with standarized field names,
# and a new 'fips' field containing the full-length FIPS code for each county.
# Dates in the raw input data are converted into yyyy-mm-dd format.
#
in_fn1 = root_dir + 'csv/county_vmt_download_v3_8_3.csv'
out_fn1 = root_dir + 'csv/vmt_data_late_july.csv'
out_csv_header = 'fips,fips_state,fips_county,state,county,date,county_vmt\n'
out_f1 = open(out_fn1, 'w')
out_f1.write(out_csv_header)

with open(in_fn1, newline='') as in_csvfile1:
    reader = csv.DictReader(in_csvfile1)
    for row in reader:
        #
        raw_state_fips = row['statefp']
        state_fips = ''
        if (len(raw_state_fips) == 1):
            state_fips = '0' + raw_state_fips
        else:
            state_fips = raw_state_fips
        # end_if
        #
        raw_county_fips = row['countyfp']
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
        # Convert month into yyyy-mm-dd format.
        raw_dayte = row['ref_dt']
        parts = raw_dayte.split('/')
        #
        raw_month = parts[0]
        month = "0" + raw_month if len(raw_month) < 2 else raw_month
        #
        raw_day = parts[1]
        day = "0" + raw_day if len(raw_day) < 2 else raw_day
        #
        year = parts[2]
        dayte = year + '-' + month + '-' + day
        #
        #
        out_str = full_fips + ',' + state_fips + ',' + county_fips + ',' + state + ',' + county + ','
        out_str += dayte + ',' + county_vmt + '\n'
        # outf.write(out_str)
        out_f1.write(out_str)
    # end_for
# end_with
out_f1.close()

# Step 2 - Extract the data from the output of Step 1 into a separate CSV file for each date.

all_daytz = [   
                '2020-07-29', 
                '2020-07-30',
                '2020-07-31' 
            ]
     
final_out_csv_header = 'fips,fips_state,fips_county,state,county,date,county_vmt,jan_avg_vmt\n'
     
def extract_data_for(in_fname, date_str):
    global root_dir, out_csv_header  
    out_fname = root_dir + '/csv/vmt-' + date_str + '.csv'
    out_f = open(out_fname, 'w')
    out_f.write(final_out_csv_header)
    
    with open(in_fname, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Debug
            # print(row)
            #
            date = row['date']
            if date == date_str:
                # Debug
                # s = 'date test passed; date = ' + date
                # print(s)
                #
                jan_avg_vmt = jan_vmt[row['fips']]
                
                out_str = row['fips'] + ',' + row['fips_state'] + ',' + row['fips_county'] + ','
                out_str += row['state'] + ',' + row['county'] + ',' + row['date'] + ','
                out_str += row['county_vmt'] + ',' + jan_avg_vmt + '\n'
                out_f.write(out_str)
            # end_if
        # end_for
    # end_with
    out_f.close()
    s = 'Extraction of data for ' + date_str + ' completed.'
    print(s)   
# end_def

in_fn2 = out_fn1
for dayt in all_daytz:
    s1 = 'Extracting data for: ' + dayt
    print(s1)
    extract_data_for(in_fn2, dayt)
# end_for
