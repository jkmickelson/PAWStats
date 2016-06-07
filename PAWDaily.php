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
<?php
// Use dates based on server, not client
Set_PHP_JS_Site_Dates();

// Include section to display
IncludeDisplaySection("PAW_Daily.js", ['DAY']);

// import the supporting data
ImportJSON($year, $month); 
?>
</head>

<!-- ============================== -->
<body>
<?php
 showHeader('PAWStats Daily');
?>
<!-- ======================================================= -->
<script>
    PAWStats.showDailyAll();
</script>
<!-- ======================================================= -->

<?php
$time_stop = microtime(true);
$exec_time = round($time_stop - $time_start, 4);
echo "<fini><br>$exec_time secs, max memory ". (memory_get_peak_usage(true)/1024/1024) . " MB</fini>\n";
?>
</body>
</html>

