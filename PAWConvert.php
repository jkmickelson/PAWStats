<?php
/**
* @package PAWConvert.php
* @version 2016.04.1
* @author Jonathan K. Mickelson 
* @copyright April 20, 2016
* @license CDDL 1.0, LGPL 2.1 (Dual-License)
* @link jkmickelson.net
* See Also: paw_convert.php (class definition)
*
* Description:
* PAW Convert is compatible with AWSTATS DATA FILE versions 7.0-7.5 (probably all 7.x)
* Also with pre-calculated DAY and TIME totals.
* PAW Convert is non-destructive, and the JSON resides alongside the original AWSTATS data.
*   (Note: PAWStats is not affliated with AWStats (awstats.org), but it respects and acknowledges
*   the expertise of Laurent Destailleur. PAWStats is intended to encourage broader use of AWStats)
*
*/
/*===== Usage =====
  // SPECIFY location to awstats data directory (the user must have read/write permissions)
  $DataDir = '/usr/local/awstats/wwwroot/data'; // set to your data directory
  $pawConvert = new PAWStatsConvertToJSON($DataDir); // create instance
 
  // CONVERT data files to JSON (options)
  $cnt = $pawConvert->ConvertAWDataToJSON();  // convert ALL files
  $cnt = $pawConvert->ConvertAWDataToJSON('all'); // convert ALL files
  $cnt = $pawConvert->ConvertAWDataToJSON('2016'); // only convert files in 2016
  // (recommended for daily use)
  $year = date('Y'); // current year, 4 digits (i.e. '2016')
  $month = date('m'); // current month, 2 digits (i.e. '04')
  $cnt = $pawConvert->ConvertAWDataToJSON($year, $month); // only convert files in current month

  echo "$cnt files converted to JSON.\n";
  
  // READ a PAW JSON file
  $site = 'example.com';
  $json = $pawConvert->GetPAWStatsJSON($site, $year, $month); // read a single JSON file
 
  echo "<pre>\n" . $json . "</pre><br>\n"; // dual use (console and browser)
=================*/

include_once('section_data/paw_convert.php');

$time_start = microtime(true);

// SPECIFY location to awstats data directory (the user must have read/write permissions)
$DataDir = '/lc/core_1/awstats/wwwroot/data/'; // set to your data directory
$pawConvert = new PAWStatsConvertToJSON($DataDir); // create instance

// CONVERT data files to JSON (options)
$year = date('Y'); // current year, 4 digits (i.e. '2016')
$month = date('m'); // current month, 2 digits (i.e. '04')
$cnt = $pawConvert->ConvertAWDataToJSON($year, $month); // only convert files in current month

$yesterdayMonth = date('m', strtotime('yesterday'));
if ($yesterdayMonth != $month) {
    // convert the full data content of the last month
    $yesterdayYear = date('Y', strtotime('yesterday'));
    $cnt += $pawConvert->ConvertAWDataToJSON($yesterdayYear, $yesterdayMonth);
}
  
//$cnt = $pawConvert->ConvertAWDataToJSON('all');
echo "$cnt files converted to JSON. <br>\n";
  
$time_stop = microtime(true);
$exec_time = round($time_stop - $time_start, 4);
echo "$exec_time ms";

?>
