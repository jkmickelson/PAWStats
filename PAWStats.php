<?php
$time_start = microtime(true);

include_once('section_data/paw_data.php');
include_once('sections/header.php');
include_once('sections/section_support.php');

//=================================
?>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="sections/PAWStats.css">

<script src="sections/PAWStats.js"></script>
<script src="sections/3rdparty/PAW_sorttable.js"></script>
<script src="sections/PAWCountryDomains.js"></script>

<?php
$outputSection = isset($_GET['output']) ? substr($_GET['output'], 0, 30) : '';

// Use dates based on server, not client
Set_PHP_JS_Site_Dates();

// Include sections to display
if (!$site) {
    // display a summary of all currently active sites
    IncludeDisplaySection("PAW_Totals.js", ['GENERAL:TotalUnique,TotalVisits', 'TIME.totals']);
}
else if ($outputSection == 'error404')  {
    IncludeDisplaySection("PAW_404Errors.js", ['SIDER_404']);
}
else if ($outputSection == 'error403')  {
}
else if ($outputSection == 'error400')  {
}
else  {
    // display detail page
    IncludeDisplaySection("PAW_Summary.js", ['GENERAL', 'TIME']);
    IncludeDisplaySection("PAW_Monthly.js", ['DAY']);
    IncludeDisplaySection("PAW_Daily.js", ['DAY']);
    IncludeDisplaySection("PAW_Weekdays.js", ['DAY']);
    IncludeDisplaySection("PAW_Hourly.js", ['TIME']);
    IncludeDisplaySection("PAW_Domains.js", ['DOMAIN']);
    IncludeDisplaySection("PAW_Hosts.js", ['VISITOR.ids']);
    IncludeDisplaySection("PAW_Robots.js", ['ROBOT.ids']);
    IncludeDisplaySection("PAW_Worms.js", ['WORMS']);
    IncludeDisplaySection("PAW_Durations.js", ['SESSION']);
    IncludeDisplaySection("PAW_FileTypes.js", ['FILETYPES']);
    IncludeDisplaySection("PAW_Downloads.js", ['DOWNLOADS']);
    IncludeDisplaySection("PAW_PagesURL.js", ['SIDER']);
    IncludeDisplaySection("PAW_Systems.js", ['OS']);
    IncludeDisplaySection("PAW_Browsers.js", ['BROWSER']);    
    IncludeDisplaySection("PAW_Screens.js", ['SCREENSIZE']);
    IncludeDisplaySection("PAW_SEReferers.js", ['SEREFERRALS']);
    IncludeDisplaySection("PAW_Referers.js", ['PAGEREFS']);
    IncludeDisplaySection("PAW_SearchWords.js", ['SEARCHWORDS']);
    IncludeDisplaySection("PAW_KeyWords.js", ['KEYWORDS']);   
    //IncludeDisplaySection("PAW_Miscellaneous.js", ['MISC']); // Obsolete
    IncludeDisplaySection("PAW_HTTPErrors.js", ['ERRORS']);
    
    //IncludeDisplaySection("PAW_LogFilter.js", ['aaa']);
}

// import the supporting data
ImportJSON($year, $month, $site); 

// import additional supporting data
if (!$site) {
    $DataSections=['GENERAL:TotalUnique'];
    // ensure all recently active sites are represented (i.e. last month also)
    // (hence: any site over 2 months without log activity is omitted)
    $lastmonth = substr("0".($month - 1), -2); // 2 digits (01-12)
    if ($lastmonth > 0) {
        ImportJSON($year, $lastmonth); 
    }
    else {
        $lastyear = $year - 1;
        ImportJSON($lastyear, '12'); 
    }
}
else if (!$outputSection){
    // detail page: import prior months (key data for certain sections)
    $DataSections=['GENERAL:TotalUnique,TotalVisits', 'TIME.totals'];
    ImportJSON($year, 'all', $site); 
}
?>
</head>

<!-- ============================== -->
<body>
<!-- ======================================================= -->
<?php if (!$site) { 
    showHeader('PAWStats Totals');
?>    
<script>
    PAWStats.showSites();
<?php } else if ($outputSection=='error404') { 
    showHeader('PAWStats 404 Errors');
?>    
<script>
    var site = '<?php echo $site;?>';
    var fnc;
    PAWStats.show404ErrorsSection(site);
<?php } else { 
    showHeader('PAWStats Full Stats');
?>
<script>
    var site = '<?php echo $site;?>';
    var fnc;
    PAWStats.showSummarySection(site);
    PAWStats.showMonthlySection(site);
    PAWStats.showDailySection(site);
    PAWStats.showWeekdaySection(site);
    PAWStats.showHourlySection(site);
    PAWStats.showDomainsSection(site);
    PAWStats.showHostsSection(site);
    PAWStats.showRobotsSection(site);
    PAWStats.showWormsSection(site);
    PAWStats.showDurationsSection(site);
    PAWStats.showFiletypesSection(site);
    PAWStats.showDownloadsSection(site);
    PAWStats.showPagesURLSection(site);
    PAWStats.showSystemsSection(site);
    PAWStats.showBrowsersSection(site);
    PAWStats.showScreensSection(site);
    PAWStats.showSEReferersSection(site);
    PAWStats.showReferersSection(site);
    PAWStats.showSearchwordsSection(site);
    PAWStats.showKeywordsSection(site);
    PAWStats.showHTTPErrorsSection(site);
<?php } ?>
</script>
<!-- ======================================================= -->

<?php
$time_stop = microtime(true);
$exec_time = round($time_stop - $time_start, 4);
echo "<fini><br>$exec_time secs, max memory ". (memory_get_peak_usage(true)/1024/1024) . " MB</fini>\n";
?>
</body>
</html>

