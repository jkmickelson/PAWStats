<?php
/**
* @package paw_data.php
* @version 2016.04.1
* @author Jonathan K. Mickelson 
* @copyright April 20, 2016
* @license CDDL 1.0, LGPL 2.1 (Dual-License)
* @link jkmickelson.net
* See Also: paw_convert.php (for conversion of AWSTATS DATA to PAW JSON files)
*
* Description:
* PAW STATS JSON corresponds with AWSTATS DATA FILE versions 7.0-7.5 (probably all 7.x)
* Also with pre-calculated DAY and TIME totals.
* PAWStats JSON files reside alongside the original AWSTATS data.
*   (Note: PAWStats is not affliated with AWStats (awstats.org), but it respects and acknowledges
*   the expertise of Laurent Destailleur. PAWStats is intended to encourage broader use of AWStats)
*
*/
/*===== Usage =====
  // SPECIFY location to awstats data directory (the user must have read permissions)
  $DataDir = '/usr/local/awstats/wwwroot/data'; // set to your data directory
  $pawData = new PAWStatsData($DataDir); // create instance

  // READ a PAWStats JSON file
  $site = 'example.com';
  $year = date('Y'); // current year, 4 digits (i.e. '2016')
  $month = date('m'); // current month, 2 digits (i.e. '04')
  $json = $pawData->GetJSON($site, $year, $month); // read a single JSON file
 
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
class TrackDynamicProperties {
    // keep track of properties dynamically added to class
    protected $DynProperties = array(); 

    public function __set($propname, $data){
        _paw_debug("DynamicSet: $propname = $data");
        $this->DynProperties[$propname] = $data;
    }

    public function __get($propname){
        if (isset($this->DynProperties[$propname])) {
            return $this->DynProperties[$propname];
        }
        else{
            _paw_debug("Unknown DynamicProperty: $propname");
            //exit;
        }
    }
}

//=========================================================
class PAWStatsData extends TrackDynamicProperties{
    public $DataDir = './';
    public $DataFiles = [];
    public $DataYears = [];
    private $DataYearsTmp = [];
    private $didDataFind = false;
    public $VisitorLimit = 30; // needs config.ini file
    public $RobotLimit = 25; // needs config.ini file

    //=========================================================
    public function __construct($DataDir) {
        // ensure trailing slash, while removing duplicate slashes
        $this->DataDir = str_replace('//', '/', ($DataDir.'/'));
    }

    //=========================================================
    public function GetJSON($config, $year, $month) {
        $jsonFilename = $this->DataDir . "/$config/pawstats$month$year.$config.json.gz";
        return $this->ReadJSONFile($jsonFilename);
    }

    //=========================================================
    public function ReadJSONFile($jsonFilename, $sections=false) {
        $json = gzdecode(file_get_contents($jsonFilename));
        if (is_array($sections)) {
            $obj = json_decode($json);
            if ($obj) {
                $newObj = (Object)[];
                foreach ($sections as $section) {
                    $items=explode('.', $section); // single item
                    if (count($items)==1) {
                        $items=explode(':', $section); // multiples
                    }
                    if (count($items) < 2) {
                        // copy entire section
                        $newObj->$section = $obj->$section;
                    }
                    else {
                        // copy items from section
                        $section = $items[0];
                        $items = explode(',', $items[1]);
                        $newObj->$section=(Object)[];
                        
                        $limit=0;
                        if ($section == 'VISITOR') {
                            $limit = $this->VisitorLimit;
                        }
                        if ($section == 'ROBOT') {
                            $limit = $this->RobotLimit;
                        }
                        
                        foreach ($items as $item) {
                            $newObj->$section->$item = 
                                $obj->$section->$item;
                                
                            if ($limit) {
                                $newObj->$section->$item = 
                                    array_slice((array)$newObj->$section->$item, 0, $limit);
                                break;
                            }
                        }
                    }
                }
                $json = $this->PrettyPAWJSON(json_encode($newObj));
            }
        }
        return $json;
    }

    //=========================================================
    public function ExtractSitename($jsonFilename) {
        $site='';
        $year = '\d{4}';
        $month = '\d{2}';
        $regex = "|awstats$month$year\.(.+)\.json.gz$|";
        //_paw_debug($regex);

        if (preg_match($regex, $jsonFilename, $match)) {
                $site = $match[1];
        }
        return $site;
    }

    //=========================================================
    public function ExtractSiteInfo($jsonFilename) {
        $site='';
        $year = '\d{4}';
        $month = '\d{2}';
        $regex = "|awstats($month)($year)\.(.+)\.json.gz$|";
        //_paw_debug($regex);

        if (preg_match($regex, $jsonFilename, $match)) {
                $site = $match[3];
        }
        return (Object)['year'=>$match[2], 'month'=>$match[1], 'site'=>$site];
    }

    //=========================================================
    public function FindDataFiles($dir='', $rlevel=0) {
        $this->didDataFind = true;
        if (!$rlevel) {
            $this->DataYears=[];
            $this->DataYearsTmp=[];
        }
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
                        $rlevel++;
                        $cnt+=$this->FindDataFiles($subdir, $rlevel);
                        $rlevel--;
                        chdir($dir);
                    }
                    else if (substr($filename, 0, 8) === 'pawstats'
                          && substr($filename, -8) === '.json.gz') {
                        $this->DataFiles[] = $dir . $filename;
                        $fileyear = substr($filename, 10, 4);
                        $this->DataYearsTmp[$fileyear] = true;
                        $cnt++;
                        //_paw_debug("FOUND $dir $filename ($fileyear)");
                    }
                }
            }
        }
        
        if (!$rlevel) {
            foreach ($this->DataYearsTmp as $year => $found) {
                $this->DataYears[] = $year;
            }
            sort($this->DataYears);
            $this->DataYearsTmp=[]; // free memory
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
        $regex = "|/pawstats($month)($year)\.(.+)\.json.gz$|";
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
