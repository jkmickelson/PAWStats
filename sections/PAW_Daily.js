var PAWStats = PAWStats || {};
if (!PAWStats.loaded) {
    alert('PLEASE ADD <script src="PAWStats.js"></script> TO YOUR CODE');
}

PAWStats.showDailyAll = function () {
    myKeys = Object.keys(this.json);
    for (var i=0;i<myKeys.length;i++) {
        var site = myKeys[i];
        
        var t_chart = this.createDailyChart(site, true);       
        document.body.appendChild(t_chart);
    }
}

PAWStats.showDailySection = function (site, showTitle) {
    showTitle = (showTitle!==false); // default value is true
    if (showTitle) {
        document.writeln('<h2 Section>Days of month<btn onclick="PAWStats.collapseSection(this)">–</btn></h2>');
    }
    
    var section = document.createElement('Section-Frame');
    var t_chart = this.createDailyChart(site);
    section.appendChild(t_chart);
    section.appendChild(document.createElement('br'));
    
    var responsive = (screen.width > 1190) ? 1 : 0; // because of poor iOS 'collapse' support
    var t_data_pt1 = this.createDailyData(site, responsive);
    section.appendChild(t_data_pt1);
    if (responsive) {
        var t_data_pt2 = this.createDailyData(site, 2);
        section.appendChild(t_data_pt2);
    }
    document.body.appendChild(section);
}

PAWStats.createDailyChart = function (site, showCaption) {
    var sitedata=this.json[site][this.year+''+this.month];
    var SumVisits=0, SumPages=0, SumHits=0, SumBandwidth=0;
    var MaxVisits=0, MaxPages=0, MaxHits=0, MaxBandwidth=0;
    var AvgVisits=0, AvgPages=0, AvgHits=0, AvgBandwidth=0;
    
    var dayCnt = this.lastDayOfReqMonth;
    var dayNumber; // divisor for running Average
    if (this.year==this.thisYear
        && this.month==this.thisMonth) {
        dayNumber = this.thisDay; // from today
    }
    else {
        dayNumber = dayCnt; // from a prior month
    }
    
    var INLINE_TABLE = document.createElement('table');
    var CAPTION = INLINE_TABLE.createCaption();
    var HEADER = INLINE_TABLE.createTHead();
    var BODY = INLINE_TABLE.createTBody();
    var FOOTER = INLINE_TABLE.createTFoot();
    var BODY_TR, FOOT_TH, TD;
    var FETCH;

    INLINE_TABLE.className  = 't-chart';
    
    if (showCaption) {
        CAPTION.innerHTML = '<a href="#">'+site+'</a>';
    }

    BODY_TR = BODY.insertRow();
    BODY_TR.className = 'tr-chart';
    FOOT_TR = FOOTER.insertRow();

    var idsJson=sitedata.DAY.ids;
    
    // First, get Max and Totals to graph the proportional barchart 
    var first=1;
    for (var i=first;i<=dayCnt;i++) {
        var dayID = (i<10) ? '0'+(i) : i;
        var key=''+this.year+this.month+dayID;
        var data=idsJson[key];
        var DAY = data || {pages:0, hits:0, bandwidth:0, visits: 0};
        
        FETCH = DAY.visits * 1;
        SumVisits+=FETCH;
        MaxVisits = (FETCH > MaxVisits) ? FETCH : MaxVisits;
        
        FETCH = DAY.pages * 1;
        SumPages+=FETCH;
        MaxPages = (FETCH > MaxPages) ? FETCH : MaxPages;
        
        FETCH = DAY.hits * 1;
        SumHits+=FETCH;
        MaxHits = (FETCH > MaxHits) ? FETCH : MaxHits;
        
        FETCH = DAY.bandwidth * 1;
        SumBandwidth+=FETCH;
        MaxBandwidth = (FETCH > MaxBandwidth) ? FETCH : MaxBandwidth;
    }
    
    // Convert to MB
    MaxBandwidth=(Math.round(((MaxBandwidth) /1024/1024) * this.precision) / this.precision);
    SumBandwidth=(Math.round(((SumBandwidth) /1024/1024) * this.precision) / this.precision);
    
    function _addBarCol(TD, className, value, height, title) {
        var title = title || '';
        TD.innerHTML+='<barcol class="'+className+'" style="height:'+height+'%"'+title+'></barcol>';
    }
    function _calcHeightRatio(value, maxValue) {
        return !maxValue ? 0 : Math.round((value / maxValue) * 100);
    }
    function _addBarColRatio(TD, className, value, maxValue) {
        var title = ' title="'+className+': '+value._toLocalNo(2)+(className=='bandwidth'?' MB':'')+'"';
        var height = _calcHeightRatio(value, maxValue);
        _addBarCol(TD, className, value, height, title);        
    }
    
    var first=1;
    for (var i=first;i<=dayCnt;i++) {
        var dayID = (i<10) ? '0'+(i) : i;
        var key=''+this.year+this.month+dayID;
        var data=idsJson[key];
        var height, CLASS;
        var yr=key.substr(0,4);
        var mth=key.substr(4,2);
        var day=key.substr(6,2);
        //this.debug('idsJson[' + key + '] = ' + data +', '+yr+'-'+mth+'-'+day);

        var DAY = data || {pages:0, hits:0, bandwidth:0, visits: 0};
        
        TD = FOOT_TR.insertCell(); 
        TD.innerHTML = day;

        TD = BODY_TR.insertCell(); 
        TD.innerHTML='';
        
        var bandwidthMB = (Math.round(((DAY.bandwidth) /1024/1024) * this.precision) / this.precision);
        
        _addBarColRatio(TD, 'visits', DAY.visits, MaxVisits, true);
        _addBarColRatio(TD, 'pages', DAY.pages, MaxPages);
        _addBarColRatio(TD, 'hits', DAY.hits, MaxHits);
        _addBarColRatio(TD, 'bandwidth', bandwidthMB, MaxBandwidth);
    }

    TD = FOOT_TR.insertCell(); 
    TD.className = 'average';
    TD.innerHTML = 'Average';

    TD = BODY_TR.insertCell(); 
    TD.className = 'average';
    TD.innerHTML='';
    
    _addBarColRatio(TD, 'visits', (SumVisits / dayNumber), MaxVisits);
    _addBarColRatio(TD, 'pages', (SumPages / dayNumber), MaxPages);
    _addBarColRatio(TD, 'hits', (SumHits / dayNumber), MaxHits);
    _addBarColRatio(TD, 'bandwidth', (SumBandwidth / dayNumber), MaxBandwidth);

    return INLINE_TABLE;
}

PAWStats.createDailyData = function (site, splitTable) {
    var sitedata=this.json[site][this.year+''+this.month];
    if (splitTable!==2) {
        this.SumVisits=0;
        this.SumPages=0;
        this.SumHits=0;
        this.SumBandwidth=0;
    }    
    
    var dayCnt = this.lastDayOfReqMonth;
    var dayNumber; // divisor for running Average
    if (this.year==this.thisYear
        && this.month==this.thisMonth) {
        dayNumber = this.thisDay; // from today
    }
    else {
        dayNumber = dayCnt; // from a prior month
    }
        
    var INLINE_TABLE = document.createElement('table');
    var CAPTION = INLINE_TABLE.createCaption();
    var HEADER = INLINE_TABLE.createTHead();
    var BODY = INLINE_TABLE.createTBody();
    var FOOTER = INLINE_TABLE.createTFoot();
    var TR, TH, TD, TH_SORT;
    
    INLINE_TABLE.className  = 't-data';
    
    TR = HEADER.insertRow(); TR.style.fontWeight='bold';
    if (splitTable===2) {
        TR.className='collapse';
    }
    
    TH = TR.insertCell(); TH.className = 'hdr lt itemtitle';
    TH.innerHTML=dayCnt+' records';
    TH.colSpan='3';
    TH = TR.insertCell(); TH.className='hdr visits';
    TH.innerHTML='Number<br>of visits';
    TH = TR.insertCell(); TH.className='hdr pages';
    TH.innerHTML='Pages';
    TH = TR.insertCell(); TH.className='hdr hits';
    TH.innerHTML='Hits';
    TH = TR.insertCell(); TH.className='hdr bandwidth';
    TH.innerHTML='Bandwidth';
    
    var idsJson=sitedata.DAY.ids;
    
    var first = 1;
    var max = dayCnt;
    if (splitTable===1 || splitTable===2) {
        if (splitTable===1) {
            max = 15;
        }
        else {
            first = 16;
        }
    }
    
    for (var i=first;i<=max;i++) {
        var dayID = (i<10) ? '0'+(i) : i;
        var key=''+this.year+this.month+dayID;
        var data=idsJson[key];
        var FETCH;
        var yr=key.substr(0,4);
        var mth=key.substr(4,2);
        var day=key.substr(6,2);
        //this.debug('idsJson[' + key + '] = ' + data +', '+yr+'-'+mth+'-'+day);

        var NoData = (i > dayNumber);
        var DAY = data || {pages:0, hits:0, bandwidth:0, visits: 0};
        
        TR = BODY.insertRow();

        if (i===first) {
            TD = TR.insertCell(); TD.className = 'lt';
            TD.innerHTML=yr;
            TD.rowSpan=31;
            if (splitTable===2) {
                TD.style.borderTop='1px solid white';
            }
        }        
        if (i===first) {
            TD = TR.insertCell(); TD.className = 'lt';
            TD.innerHTML=mth;
            TD.rowSpan=31;
            if (splitTable===2) {
                TD.style.borderTop='1px solid white';
            }
        }        
        TD = TR.insertCell(); TD.className = 'lt';
        TD.innerHTML=day;

        TD = TR.insertCell(); 
        FETCH = DAY.visits * 1;
        TD.innerHTML = NoData ? '' : FETCH._toLocalNo();
        this.SumVisits+=FETCH;

        TD = TR.insertCell(); 
        FETCH = DAY.pages * 1;
        TD.innerHTML = NoData ? '' : FETCH._toLocalNo();
        this.SumPages+=FETCH;

        TD = TR.insertCell(); 
        FETCH = DAY.hits * 1;
        TD.innerHTML = NoData ? '' : FETCH._toLocalNo();
        this.SumHits+=FETCH;

        TD = TR.insertCell(); 
        FETCH = (Math.round(((DAY.bandwidth) /1024/1024) * this.precision) / this.precision);
        TD.innerHTML=NoData ? '' : FETCH._toLocalNo(2);
        TD.innerHTML+=' MB';
        this.SumBandwidth+=FETCH;

    }
    
    if (splitTable!==1) {        
        TR = FOOTER.insertRow();
        TR.style.backgroundColor = '#F0F0F0';

        TH = TR.insertCell();
        TH.innerHTML='Average'; TH.colSpan='3';
        TH = TR.insertCell();
        TH.innerHTML=( this.SumVisits / dayNumber )._toLocalNo();
        TH = TR.insertCell();
        TH.innerHTML=( this.SumPages / dayNumber )._toLocalNo();
        TH = TR.insertCell();
        TH.innerHTML=( this.SumHits / dayNumber )._toLocalNo();
        TH = TR.insertCell();
        TH.innerHTML=(this.SumBandwidth / dayNumber)._toLocalNo(2);
        TH.innerHTML+=' MB';
        
        TR = FOOTER.insertRow();
        TR.style.backgroundColor = '#E0E0E0';

        TH = TR.insertCell();
        TH.innerHTML='Total'; TH.colSpan='3';
        TH = TR.insertCell();
        TH.innerHTML=this.SumVisits._toLocalNo();
        TH = TR.insertCell();
        TH.innerHTML=this.SumPages._toLocalNo();
        TH = TR.insertCell();
        TH.innerHTML=this.SumHits._toLocalNo();
        TH = TR.insertCell();
        TH.innerHTML=this.SumBandwidth._toLocalNo(2);
        TH.innerHTML+=' MB';
    }
    
    return INLINE_TABLE;
}


