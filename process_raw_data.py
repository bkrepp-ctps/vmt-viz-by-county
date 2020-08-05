# Script to massage raw county-by-county VMT data into a format suitable for the viz app.
# This script is based on the format of the data delivered up to and including June 28, 2020.

import csv

root_dir = r'c:/Users/ben_k/work_stuff/vmt-viz-by-county/'

# Step 1
# Read raw input CSV file, and produce output CSV file with standarized field names,
# and a new 'fips' field containing the full-length FIPS code for each county.
# Dates in the raw input data are converted into yyyy-mm-dd format.
#
in_fn1 = root_dir + 'csv/county_vmt_download_update2_7_1.csv'
out_fn1 = root_dir + 'csv/vmt_data.csv'
out_csv_header = 'fips,fips_state,fips_county,state,county,date,county_vmt,jan_avg_vmt\n'
out_f1 = open(out_fn1, 'w')
out_f1.write(out_csv_header)

with open(in_fn1, newline='') as in_csvfile1:
    reader = csv.DictReader(in_csvfile1)
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
        jan_avg_vmt = row['jan_avg_vmt']
        #
        out_str = full_fips + ',' + state_fips + ',' + county_fips + ',' + state + ',' + county + ','
        out_str += dayte + ',' + county_vmt + ',' + jan_avg_vmt + '\n'
        # outf.write(out_str)
        out_f1.write(out_str)
    # end_for
# end_with
out_f1.close()

# Step 2 - Extract the data from the output of Step 1 into a separate CSV file for each date.

all_daytz = [   
                '2020-03-01', 
                '2020-03-02', 
                '2020-03-03', 
                '2020-03-04', 
                '2020-03-05', 
                '2020-03-06', 
                '2020-03-07', 
                '2020-03-08', 
                '2020-03-09', 
                '2020-03-10', 
                '2020-03-11', 
                '2020-03-12', 
                '2020-03-13', 
                '2020-03-14', 
                '2020-03-15', 
                '2020-03-16', 
                '2020-03-17', 
                '2020-03-18', 
                '2020-03-19', 
                '2020-03-20', 
                '2020-03-21', 
                '2020-03-22', 
                '2020-03-23', 
                '2020-03-24', 
                '2020-03-25', 
                '2020-03-26', 
                '2020-03-27', 
                '2020-03-28',
                '2020-03-30', 
                '2020-03-31',
                '2020-04-01', 
                '2020-04-02', 
                '2020-04-03', 
                '2020-04-04', 
                '2020-04-05', 
                '2020-04-06', 
                '2020-04-07', 
                '2020-04-08', 
                '2020-04-09', 
                '2020-04-10', 
                '2020-04-11', 
                '2020-04-12', 
                '2020-04-13', 
                '2020-04-14', 
                '2020-04-15', 
                '2020-04-16', 
                '2020-04-17', 
                '2020-04-18', 
                '2020-04-19', 
                '2020-04-20', 
                '2020-04-21', 
                '2020-04-22', 
                '2020-04-23', 
                '2020-04-24', 
                '2020-04-25', 
                '2020-04-26', 
                '2020-04-27', 
                '2020-04-28', 
                '2020-04-29', 
                '2020-04-30', 
                '2020-05-01', 
                '2020-05-02', 
                '2020-05-03', 
                '2020-05-04', 
                '2020-05-05', 
                '2020-05-06', 
                '2020-05-07', 
                '2020-05-08', 
                '2020-05-09', 
                '2020-05-10', 
                '2020-05-11', 
                '2020-05-12', 
                '2020-05-13', 
                '2020-05-14', 
                '2020-05-15', 
                '2020-05-16', 
                '2020-05-17', 
                '2020-05-18', 
                '2020-05-19', 
                '2020-05-20', 
                '2020-05-21', 
                '2020-05-22', 
                '2020-05-23', 
                '2020-05-24', 
                '2020-05-25', 
                '2020-05-26', 
                '2020-05-27', 
                '2020-05-28', 
                '2020-05-29', 
                '2020-05-30', 
                '2020-05-31', 
                '2020-06-01', 
                '2020-06-02', 
                '2020-06-03', 
                '2020-06-04', 
                '2020-06-05', 
                '2020-06-06', 
                '2020-06-07', 
                '2020-06-08', 
                '2020-06-09', 
                '2020-06-10', 
                '2020-06-11', 
                '2020-06-12', 
                '2020-06-13', 
                '2020-06-14', 
                '2020-06-15', 
                '2020-06-16', 
                '2020-06-17', 
                '2020-06-18', 
                '2020-06-19', 
                '2020-06-20', 
                '2020-06-21', 
                '2020-06-22', 
                '2020-06-23', 
                '2020-06-24', 
                '2020-06-25', 
                '2020-06-26', 
                '2020-06-27', 
                '2020-06-28' 
                
                ]
                
def extract_data_for(in_fname, date_str):
    global root_dir, out_csv_header  
    out_fname = root_dir + '/csv/vmt-' + date_str + '.csv'
    out_f = open(out_fname, 'w')
    out_f.write(out_csv_header)
    
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
                out_str = row['fips'] + ',' + row['fips_state'] + ',' + row['fips_county'] + ','
                out_str += row['state'] + ',' + row['county'] + ',' + row['date'] + ','
                out_str += row['county_vmt'] + ',' + row['jan_avg_vmt'] + '\n'
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
