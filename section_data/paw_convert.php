<?php
/**
* @package paw_convert.php
* @version 2016.04.1
* @author Jonathan K. Mickelson 
* @copyright April 18, 2016
* @license CDDL 1.0, LGPL 2.1 (Dual-License)
* @link jkmickelson.net
* See Also: paw_data.php (for regular use of PAW JSON files)
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

//=========================================================
if (!isset($_PAW_DEBUG)) {
    // prevent duplicate declarations (from other self-contained PAWStat files)
    $_PAW_DEBUG_=true;
    function _paw_debug($content) {
        global $_PAW_DEBUG_;
        if ($_PAW_DEBUG_) {
            if (is_array($content) || is_object($content)) {
                echo "<pre>\n";
                print_r( $content );
                echo "</pre><br>\n";
            }
            else {
                echo $content . " <br>\n";
            }
        }
    }
}

//=========================================================
class PAWStatsConvertToJSON {
    public $DataDir = './';
    public $DataFiles = [];
    private $didDataFind = false;

    //=========================================================
    public function __construct($DataDir) {
        // ensure trailing slash, while removing duplicate slashes
        $this->DataDir = str_replace('//', '/', ($DataDir.'/'));
    }

    //=========================================================
    public function ConvertAWDataToJSON($year='all', $month='all') {
        $myFiles = $this->FilterDataFiles($year, $month);
        $cnt=0;

        foreach ($myFiles as $awFilename) {
            // change file extension
            $jsonFilename = substr($awFilename, 0, -4) . '.json';
            // change awstats to pawstats (in case awstats develops its own json format)
            $regex = '|/(awstats[^/]+$)|';
            $jsonFilename = preg_replace($regex, '/p$1', $jsonFilename);
            
            //_paw_debug( $awFilename );
            //_paw_debug( $jsonFilename );

            $obj = $this->ReadDataFile($awFilename);
            $obj = array_merge(
                ['NOTICE'=>'PAW STATS JSON 7.5, converted from AWSTATS DATA FILE 7.x'],
                (array)$obj
            );

            $json = $this->PrettyPAWJSON( json_encode($obj) );
            if (false) {
                echo "<pre>"; _paw_debug($json); echo "</pre>";
                exit;
            }
            //file_put_contents($jsonFilename, $json); // without compression

            $outFile=$jsonFilename.'.gz';
            file_put_contents($outFile, gzencode($json, 9));
            touch($outFile, filemtime($awFilename));
            $cnt++;
        }
        return $cnt;
    }

    //=========================================================
    public function GetPAWStatsJSON($config, $year, $month) {
        $jsonFilename = $this->DataDir . "/$config/pawstats$month$year.$config.json.gz";
        return gzdecode(file_get_contents($jsonFilename));
    }

    //=========================================================
    public function FindDataFiles($dir='') {
        $this->didDataFind = true;
        $cnt = 0;
        if ($dir==='') {
            $dir = $this->DataDir;
        }
        // ensure trailing slash, while removing duplicate slashes
        $dir = str_replace('//', '/', ($dir.'/'));
        //_paw_debug("SEARCHING $dir");

        $hDir = @opendir($dir);
        if ($hDir) {
            while ( ($filename = readdir($hDir)) !== false) {
                // ignore hidden files and relative directories
                if (substr($filename, 0, 1) !== '.') {
                    if (is_dir($dir . $filename)) {
                        $subdir = $dir . $filename;
                        chdir($subdir);
                        $this->FindDataFiles($subdir);
                        chdir($dir);
                    }
                    else if (substr($filename, 0, 7) === 'awstats'
                          && substr($filename, -4) === '.txt') {
                        $this->DataFiles[] = $dir . $filename;
                        $cnt++;
                        //_paw_debug("FOUND $dir $filename");
                    }
                }
            }
        }
        return $cnt;
    }

    //=========================================================
    public function FilterDataFiles($year='all', $month='all') {
        if (!$this->didDataFind) {
            $this->FindDataFiles();
        }

        $FilterFiles = [];
        $SortValues = [];
        if ($year==='all') {
            $year = '\d{4}';
        }
        if ($month==='all') {
            $month = '\d{2}';
        }
        $regex = "|/awstats($month)($year)\.(.+)\.txt$|";
        //_paw_debug($regex);

        foreach ($this->DataFiles as $datafile) {
            if (preg_match($regex, $datafile, $match)) {
                $sortvalue = $match[3].$match[2].$match[1];
                $SortValues[] = $sortvalue; // enable sorting by sitename, year, month.
                $FilterFiles[] = $datafile;
            }
        }
        if ($SortValues) {
            array_multisort($SortValues, $FilterFiles);
        }
        return $FilterFiles;
    }

    //=========================================================
    public function ReadDataFile($datafile) {
	$filecontents = file_get_contents($datafile);
        if ($filecontents === false) {
            return false;
        }

        if (preg_match_all('/\nBEGIN_([A-Z_0-9]+) /', $filecontents, $SectionMatches)) {
            $SectionNames = $SectionMatches[1];
            $obj = (object)[];

            foreach ($SectionNames as $SectionName) {
                //_paw_debug($SectionName);
                $datarows=[];
                if (preg_match('/\nBEGIN_'.$SectionName.' \d+\n(.*)\nEND_'.$SectionName.'\n/s',
                       $filecontents, $SectionBlock)) {
                    $datarows = explode("\n", $SectionBlock[1]);
                }

                if (!count($datarows)) {
                    $obj->$SectionName = ''; // empty section
                    continue; 
                }

                $SectionMethod = "ReadSection_$SectionName";
                $StandardMethod = "ReadSection_Standardized";

                if ( method_exists($this, $SectionMethod) ) {
                    //_paw_debug("Calling \$this->$SectionMethod(datarows)");
                    $args = [$SectionName, &$datarows];
                    $ret = call_user_func_array(array($this, $SectionMethod), $args);
                    if ($ret) {
                        $obj->$SectionName = $ret;
                    }
                    else {
                        $obj->$SectionName = '';
                    }
                }
                else if ( $this->StandardFields[$SectionName]
                        && method_exists($this, $StandardMethod) ) {
                    //_paw_debug("Calling \$this->$SectionMethod(filecontents)");
                    $args = [$SectionName, &$datarows];
                    $ret = call_user_func_array(array($this, $StandardMethod), $args);
                    if ($ret) {
                        $obj->$SectionName = $ret;
                    }
                    else {
                        $obj->$SectionName = '';
                    }
                }
                else {
                    _paw_debug("\$this->$SectionMethod is NOT defined");
                    _paw_debug("and '$SectionName' is NOT defined in \$this->\$StandardFields");
                    //exit;
                }
            }

            //_paw_debug($obj);
            return ($obj);
        }

	return false;
    }

    //=========================================================
    private $StandardFields = [
        'BROWSER'=>['hits', 'pages'],
        'CLUSTER'=>['pages', 'hits', 'bandwidth'],
        'DAY'=>['@CreateTotals', 'pages', 'hits', 'bandwidth', 'visits'],
        'DOMAIN'=>['pages', 'hits', 'bandwidth'],
        'DOWNLOADS'=>['hits', 'partial206', 'bandwidth'],
        'EMAILSENDER'=>['hits', 'bandwidth', 'lastvisit'],
        'EMAILRECEIVER'=>['hits', 'bandwidth', 'lastvisit'],
        'ERRORS'=>['hits', 'bandwidth'],
        'FILETYPES'=>['hits', 'bandwidth', 'nocomp', 'withcomp'],
        'LOGIN'=>['pages', 'hits', 'bandwidth', 'lastvisit'],
        'ORIGIN'=>['pages', 'hits'],
        'OS'=>['hits'],
        'PAGEREFS'=>['pages', 'hits'],
        'SCREENSIZE'=>['hits'],
        'SEREFERRALS'=>['pages', 'hits'],
        'SESSION'=>['visits'],
        'UNKNOWNREFERER'=>['lastvisit'],
        'UNKNOWNREFERERBROWSER'=>['lastvisit'],
        'VISITOR'=>['pages', 'hits', 'bandwidth', 'lastvisit', 'startdate', 'lasturl'],

        'ROBOT'=>['hits', 'bandwidth', 'lastvisit', 'robot_txt'],
        'WORMS'=>['hits', 'bandwidth', 'lastvisit'],

        'KEYWORDS'=>['count'],
        'SEARCHWORDS'=>['count'],

        'SIDER'=>['pages', 'bandwidth', 'entry', 'exit'],
        'SIDER_204'=>['hits', 'lasturlref'],
        'SIDER_206'=>['hits', 'lasturlref'],
        'SIDER_301'=>['hits', 'lasturlref'],
        'SIDER_302'=>['hits', 'lasturlref'],
        'SIDER_400'=>['hits', 'lasturlref'],
        'SIDER_403'=>['hits', 'lasturlref'],
        'SIDER_404'=>['hits', 'lasturlref'],
        'SIDER_500'=>['hits', 'lasturlref'],
        'SIDER_503'=>['hits', 'lasturlref'],

        'GENERAL'=>[
            'LastLine'=>['date', 'lineno', 'offset', 'signature'],
            'FirstTime'=>['date'],
            'LastTime'=>['date'],
            'LastUpdate'=>['date', 'parsed', 'oldparsed', 'newparsed', 'corrupted', 'dropped'],
            'TotalVisits'=>['count'],
            'TotalUnique'=>['count'],
            'MonthHostsKnown'=>['count'],
            'MonthHostsUnknown'=>['count']
        ]
    ];

    //=========================================================
    private function ReadSection_Standardized($SectionName, &$datarows) {
        // this handles fixed fields and the additional optional fields
        $obj = (object)[];
        $addTotals=false;

        $StandardFieldNames = $this->StandardFields[$SectionName];
        $OriginalFieldNames = $StandardFieldNames;

        // Check for @CreateTotals flag
        if (isset($StandardFieldNames[0]) && $StandardFieldNames[0]==='@CreateTotals') {
            $addTotals=true;
            $obj->totals=(object)[];
            array_shift($StandardFieldNames);
        }

        foreach ($datarows as $row) {
            $items = explode(' ', trim($row));

            $id = array_shift($items);
            // special check for internet provided data (account for embedded spaces)
            while ($SectionName=='ROBOT' && $items && !is_numeric($items[0])) {
                $id .= ' '.array_shift($items);
            }

            // Check for row specific fields by $id
            $rowSpecific = false;
            if (isset($OriginalFieldNames[$id][0])) {
                $rowSpecific = true;
                $StandardFieldNames = $OriginalFieldNames[$id];
                $obj->$id = (object)[];
            }
            else {
                // generic field rows
                if (!isset($obj->ids)) {
                    $obj->ids=[];
                }
                $obj->ids[$id] = (object)[];
            }

            $max = count($items);
            for ($i=0; $i < $max; $i++) {
                if (!isset($StandardFieldNames[$i])) {
                    _paw_debug("StandardFields missing fieldname for $SectionName:$i ($id)");
                    _paw_debug($StandardFieldNames);
                    //exit;
                }
                $fldname = $StandardFieldNames[$i];
                if ($rowSpecific) {
                    $obj->$id->$fldname = $items[$i];
                }
                else {
                    $obj->ids[$id]->$fldname = $items[$i];
                }

                if ($addTotals && is_numeric($items[$i])) {
                    if (!isset($obj->totals->$fldname)) {
                        $obj->totals->$fldname = 0;
                    }
                    $obj->totals->$fldname += $items[$i];
                }
            }
        }
        return $obj;
    }

    //=========================================================
    private function ReadSection_MAP($SectionName, &$datarows) {
        $obj = (object)[];
        $obj->ids=['none'=>"Not Applicable for JSON"];
        return $obj;
    }

    //=========================================================
    private function ReadSection_MISC($SectionName, &$datarows) {
        $obj = (object)[];
        $obj->ids=[];
        $obj->supported=[];
        $obj->unsupported=[];

        foreach ($datarows as $row) {
            list( $id, $pages, $hits, $bandwidth ) = explode(' ', trim($row));

            if (strpos($id, 'Support')!==false
            || strpos($id, 'AddTo')!==false
            || strpos($id, 'Enabled')!==false){
                $id = str_replace ('Support', '', $id);
                $id = str_replace ('Enabled', '', $id);
                $obj->supported[$id] = (object)[
                    'pages' => $pages,
                    'hits' => $hits,
                    'bandwidth' => $bandwidth
                ];
            }
            else if (strpos($id, 'Disabled')!==false){
                $id = str_replace ('Disabled', '', $id);
                $obj->unsupported[$id] = (object)[
                    'pages' => $pages,
                    'hits' => $hits,
                    'bandwidth' => $bandwidth
                ];
            }
            else {
                $obj->ids[$id] = (object)[
                    'pages' => $pages,
                    'hits' => $hits,
                    'bandwidth' => $bandwidth
                ];
            }
         }
        return $obj;
    }
    
    //=========================================================
    // Special: needed due to $strHour (proper handling of index of 0 thru 23)
    // and for child object "notviewed". (could be handled with "notviewed.pages"
    // in $StandardFields and ReadSection_Standardized, but this is the only occurence)
    private function ReadSection_TIME($SectionName, &$datarows) {
        $obj = (object)[];
        $obj->ids=[];
        $obj->totals = (object)[
            'pages' => 0,
            'hits' => 0,
            'bandwidth' => 0,
            'notviewed' => (object)[
                'pages' => 0,
                'hits' => 0,
                'bandwidth' => 0,
            ]
        ];

        foreach ($datarows as $row) {
            list( $hour, $pages, $hits, $bandwidth,
                  $notViewed_pages, $notViewed_hits, $notViewed_bandwidth
             ) = explode(' ', trim($row));

            $strHour = '' . substr('00'.$hour, -2);

            $obj->ids[$strHour] = (object)[
                'pages' => $pages + 0,
                'hits' => $hits + 0,
                'bandwidth' => $bandwidth + 0,
                'notviewed' => (object)[
                    'pages' => $notViewed_pages + 0,
                    'hits' => $notViewed_hits + 0,
                    'bandwidth' => $notViewed_bandwidth + 0,
                ]
            ];

            $obj->totals = (object)[
                'pages' => $obj->totals->pages + $pages,
                'hits' => $obj->totals->hits + $hits,
                'bandwidth' => $obj->totals->bandwidth + $bandwidth,
                'notviewed' => (object)[
                    'pages' => $obj->totals->notviewed->pages + $notViewed_pages,
                    'hits' => $obj->totals->notviewed->hits + $notViewed_hits,
                    'bandwidth' => $obj->totals->notviewed->bandwidth + $notViewed_bandwidth,
                ]
            ];
        }
        return $obj;
    }

    //=========================================================
    private function PrettyPAWJSON($json) {
        // "SECTION_NAME":{ -- add newline, indent 2 spaces
        $regex = '/("[A-Z_]+[0-9]*"):\{/';
        $json = preg_replace($regex, "$1:\n  {", $json);
        // },"SECTION_NAME" -- add newline
        $regex = '/\},("[A-Z_]+[0-9]*")/';
        $json = preg_replace($regex, "},\n$1", $json);
        // ","SECTION_NAME" -- add newline
        $regex = '/",("[A-Z_]+[0-9]*")/';
        $json = preg_replace($regex, "\",\n$1", $json);
        // {"SECTION_NAME" -- add newline
        $regex = '/{("[A-Z_]+[0-9]*")/';
        $json = preg_replace($regex, "{\n$1", $json);
        // }$ -- add newline for last brace
        $regex = '/\}$/';
        $json = preg_replace($regex, "\n}", $json);
        // }$ -- add newline between content, indent 4 spaces
        $json = str_replace("},\"", "},\n    \"", $json);

        // correct "PDF" exception: remove newline between content, indent 4 spaces
        $json = str_replace("\"PDF\":\n  ", "    \"PDF\":", $json);

        // {"ids":{" -- add newline between content, indent 4 spaces
        $json = str_replace("  {\"ids\":{\"", "  {\"ids\":{\n    \"", $json);
        // "supported":{" -- add newline between content, indent 4 spaces
        $json = str_replace("  \"supported\":{\"", "\"supported\":{\n    \"", $json);
        // "unsupported":{" -- add newline between content, indent 4 spaces
        $json = str_replace("  \"unsupported\":{\"", "\"supported\":{\n    \"", $json);
        // "totals":{" -- indent only 2 spaces
        $json = str_replace("  \"totals\":{\"", "\"totals\":{\"", $json);

        return $json;
    }

}

?>
