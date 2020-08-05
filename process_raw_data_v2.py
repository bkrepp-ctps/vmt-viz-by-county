<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Test of jQueryUI Datepicker Control</title>
<!-- <link rel="stylesheet" href="dataviz.css"/> -->
<link rel="stylesheet" href="libs/jquery-ui-1.12.1/jquery-ui.css"/>
<script src="libs/jquery.min-3.5.1.js"></script>
<script src="libs/jquery-ui-1.12.1/jquery-ui.js"></script>
<script src="libs/lodash.js"></script>
<script src="libs/d3.js"></script>
<script src="libs/d3-legend-2.25.6.js"></script>
</head>
<body>
<h2>Test of jQueryUI Datepicker Control</h2>
    <div id="options">
        <span>
            Select date:
            &nbsp;&nbsp;&nbsp;
            <input type="text" id="datepicker">
        </span>
    </div>
<script>
    // Convert a "US-style" date string into a "yyyy-mm-dd" format date string.
    // What we can a "US-style" date string is one in jQueryUI "datepicker" format 'MM d, yy'.
    // Note the following about the datepicker format 'MM d, yy':
    //     MM - full text of name of month, e.g., "January"
    //     d  - day of month, with NO leading zeros
    //     yy - four digit (yes, FOUR-digit) year
    // ==> There is EXACTLY one space between the month name and the day-of-month.
    // ==> There is EXACTLY one space between the comma (',') and the year    
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
    }
    var minDate, maxDate;
    // $('#datepicker').datepicker({ dateFormat: 'yy-mm-dd' });
    $('#datepicker').datepicker({ dateFormat: 'MM d, yy' });
    
    $('#datepicker').datepicker({ showOn: "focus" });
    /*
    minDate = "2020-03-01",
       maxDate = "2020-06-20";
    */
    minDate = "March 1, 2020";
    maxDate = "June 20, 2020";    
    $('#datepicker').datepicker("option", "minDate", minDate);
    $('#datepicker').datepicker("option", "maxDate", maxDate);
    
    // $('#datepicker').datepicker("option", "defaultDate", '2020-03-01');
    // $('#datepicker').datepicker( "setDate", "2020-03-01" );
    $('#datepicker').datepicker("option", "defaultDate", minDate);
    $('#datepicker').datepicker( "setDate", minDate );

    $('#datepicker').datepicker("option", "onClose",
    function(dateText, inst) {
        var _DEBUG_HOOK_ = 0,
           current_date;
        if (dateText === "") return;
        coolDate  = usDateStrToAppDateStr(dateText);
        console.log(dateText + '  ==>  ' + coolDate);
        _DEBUG_HOOK_ = 1;
    });

</script>
</body>
</html>
