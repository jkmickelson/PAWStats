<?php
// (inline code; global space)


$DataYears=[];
$DataSections=[];
function ImportJSON($year, $month, $site='') {
    global $DataYears, $DataSections;
    $DataSections = array_unique($DataSections);
    $pawData = new PAWStatsData('/lc/core_1/awstats/wwwroot/data/');
    $JSONFiles =  $pawData->FilterDataFiles($year, $month);
    
    echo "<script>\n// initial content is retained (allows for select data from prior months to be loaded also)\n";
    foreach ($JSONFiles as $JSONFilename) {
        $info = $pawData->ExtractSiteInfo($JSONFilename);
        if (!$site || $site == $info->site) {
            $json = $pawData->ReadJSONFile($JSONFilename, $DataSections);
            // initial content is retained
            echo "PAWStats.json['$info->site']=PAWStats.json['$info->site'] || {};\n";
            echo "PAWStats.json['$info->site']['$info->year$info->month']=PAWStats.json['$info->site']['$info->year$info->month'] || $json;\n";
        }
    }
    echo "</script>\n";
    
    $DataYears = $pawData->DataYears;
}

function IncludeDisplaySection($jsFile, $sections) {
    global $DataSections;
    echo '<script src="sections/' . $jsFile . '"></script>' . "\n";
    $DataSections=array_merge($DataSections, $sections);    
}


function Set_PHP_JS_Site_Dates() {
    global $site, $year, $month;
    global $priorMonth, $priorMonthYear, $priorMonthLastDay;
    global $thisYear, $thisMonth, $thisDay, $lastDayOfThisMonth;

    echo "<script>\n";
    $site = isset($_GET['site']) ? $_GET['site'] : '';
    echo "PAWStats.site='$site';\n\n";
    
    // Use dates based on server, not client
    $year = isset($_GET['year']) ? $_GET['year'] : date('Y'); // current year, 4 digits (i.e. '2016')
    $month = isset($_GET['month']) ? $_GET['month'] : date('m'); // current month, 2 digits (i.e. '04')
    $month = substr('0'.$month, -2);

    $datestring="$year-$month last day of this month";
    $dt=date_create($datestring);    
    echo "PAWStats.lastDayOfReqMonth='".$dt->format('d')."';\n";
    echo "PAWStats.year='$year';\n";
    echo "PAWStats.month='$month';\n\n";

    $datestring="$year-$month last day of last month";
    $dt=date_create($datestring);
    $priorMonth = $dt->format('m');
    $priorMonthYear = $dt->format('Y');
    $priorMonthLastDay = $dt->format('d');

    echo "PAWStats.priorMonth='$priorMonth';\n";
    echo "PAWStats.priorMonthYear='$priorMonthYear';\n";
    echo "PAWStats.priorMonthLastDay='$priorMonthLastDay';\n\n";

    $thisYear = date('Y');
    $thisMonth = date('m');
    $thisDay = date('d');
    $lastDayOfThisMonth = date('d', strtotime('last day of this month'));
    echo "PAWStats.thisYear='$thisYear';\n";
    echo "PAWStats.thisMonth='$thisMonth';\n";
    echo "PAWStats.thisDay='$thisDay';\n";
    echo "PAWStats.lastDayOfThisMonth='$lastDayOfThisMonth';\n";
    
    echo "</script>\n";
}
?>

