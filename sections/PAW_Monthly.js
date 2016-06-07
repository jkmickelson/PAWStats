var PAWStats = PAWStats || {};
if (!PAWStats.loaded) {
    alert('PLEASE ADD <script src="PAWStats.js"></script> TO YOUR CODE');
}

PAWStats.showMonthlyAll = function () {
    myKeys = Object.keys(this.json);
    for (var i=0;i<myKeys.length;i++) {
        var site = myKeys[i];
        
        var t_chart = this.createMonthlyChart(site, true);       
        document.body.appendChild(t_chart);
    }
}

PAWStats.showMonthlySection = function (site, showTitle) {
    showTitle = (showTitle!==false); // default value is true
    if (showTitle) {
        document.writeln('<h2 Section>Monthly history<btn onclick="PAWStats.collapseSection(this)">–</btn></h2>');
    }
    
    
    var section = document.createElement('Section-Frame');
    var t_chart = this.createMonthlyChart(site);
    section.appendChild(t_chart);
    section.appendChild(document.createElement('br'));
    
    var responsive = (screen.width > 1190) ? 1 : 0; // because of poor iOS 'collapse' support
    var t_data_pt1 = this.createMonthlyData(site, responsive);
    section.appendChild(t_data_pt1);
    if (responsive) {
        var t_data_pt2 = this.createMonthlyData(site, 2);
        section.appendChild(t_data_pt2);
    }
    document.body.appendChild(section);
}

PAWStats.createMonthlyChart = function (site, showCaption) {
    var sitedata=this.json[site];
    var SumUniq=0, SumVisits=0, SumPages=0, SumHits=0, SumBandwidth=0;
    var MaxUniq=0, MaxVisits=0, MaxPages=0, MaxHits=0, MaxBandwidth=0;
    var AvgUniq=0, AvgVisits=0, AvgPages=0, AvgHits=0, AvgBandwidth=0;
    
    var mthCnt = 12;
    var mthNumber; // divisor for running Average
    if (this.year==this.thisYear) {
        mthNumber = this.month; // from requested month
    }
    else {
        mthNumber = this.month; // from requested month
        //mthNumber = mthCnt; // from a prior year
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

    // First, get Max and Totals to graph the proportional barchart 
    var first=1;
    for (var i=first;i<=mthCnt;i++) {
        var mthID = (i<10) ? '0'+(i) : i;
        var key=''+this.year+mthID;
        if (i>mthNumber) { //ignore months greater than requested month
            key='ignore';
        }
        var data = sitedata[key] || {GENERAL:false, TIME:{totals:false}};
    
        var GENERAL = data.GENERAL || {TotalUnique:{count:0}, TotalVisits:{count:0}};
        var MTH = data.TIME.totals || {"pages":0,"hits":0,"bandwidth":0,
                            "notviewed":{"pages":0,"hits":0,"bandwidth":0}};
        
        FETCH = GENERAL.TotalUnique.count * 1;
        SumUniq+=FETCH;
        MaxUniq = (FETCH > MaxUniq) ? FETCH : MaxUniq;
        
        FETCH = GENERAL.TotalVisits.count * 1;
        SumVisits+=FETCH;
        MaxVisits = (FETCH > MaxVisits) ? FETCH : MaxVisits;
        
        FETCH = MTH.pages * 1;
        SumPages+=FETCH;
        MaxPages = (FETCH > MaxPages) ? FETCH : MaxPages;
        
        FETCH = MTH.hits * 1;
        SumHits+=FETCH;
        MaxHits = (FETCH > MaxHits) ? FETCH : MaxHits;
        
        FETCH = MTH.bandwidth * 1;
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
        var digits = (className == 'bandwidth') ? 2 : 0
        var title = ' title="'+className+': '+value._toLocalNo(digits)+(className=='bandwidth'?' MB':'')+'"';
        var height = _calcHeightRatio(value, maxValue);
        _addBarCol(TD, className, value, height, title);        
    }
    
    var first=1;
    for (var i=first;i<=mthCnt;i++) {
        var mthID = (i<10) ? '0'+(i) : i;
        var key=''+this.year+mthID;
        if (i>mthNumber) { //ignore months greater than requested month
            key='ignore';
        }
        var data = sitedata[key] || {GENERAL:false, TIME:{totals:false}};

        var height, CLASS;
        var yr=key.substr(0,4);
        var mth=key.substr(4,2);
        
        var NoData = (i > mthNumber);
        var GENERAL = data.GENERAL || {TotalUnique:{count:0}, TotalVisits:{count:0}};
        var MTH = data.TIME.totals || {"pages":0,"hits":0,"bandwidth":0,
                            "notviewed":{"pages":0,"hits":0,"bandwidth":0}};
        
        TD = FOOT_TR.insertCell(); 
        TD.innerHTML = i;

        TD = BODY_TR.insertCell(); 
        TD.innerHTML='';
        
        var bandwidthMB = (Math.round(((MTH.bandwidth) /1024/1024) * this.precision) / this.precision);
        
        _addBarColRatio(TD, 'uniq', GENERAL.TotalUnique.count, MaxUniq, true);
        _addBarColRatio(TD, 'visits', GENERAL.TotalVisits.count, MaxVisits, true);
        _addBarColRatio(TD, 'pages', MTH.pages, MaxPages);
        _addBarColRatio(TD, 'hits', MTH.hits, MaxHits);
        _addBarColRatio(TD, 'bandwidth', bandwidthMB, MaxBandwidth);
    }

    TD = FOOT_TR.insertCell(); 
    TD.className = 'average';
    TD.innerHTML = 'Average';

    TD = BODY_TR.insertCell(); 
    TD.className = 'average';
    TD.innerHTML='';
    
    _addBarColRatio(TD, 'uniq', (SumUniq / mthNumber), MaxUniq);
    _addBarColRatio(TD, 'visits', (SumVisits / mthNumber), MaxVisits);
    _addBarColRatio(TD, 'pages', (SumPages / mthNumber), MaxPages);
    _addBarColRatio(TD, 'hits', (SumHits / mthNumber), MaxHits);
    _addBarColRatio(TD, 'bandwidth', (SumBandwidth / mthNumber), MaxBandwidth);

    return INLINE_TABLE;
}

PAWStats.createMonthlyData = function (site, splitTable) {
    var sitedata=this.json[site];
    if (splitTable!==2) {
        this.SumUniq=0;
        this.SumVisits=0;
        this.SumPages=0;
        this.SumHits=0;
        this.SumBandwidth=0;
    }    
    
    var mthCnt = 12;
    var mthNumber; // divisor for running Average
    if (this.year==this.thisYear) {
        mthNumber = this.month; // from requested month
        //mthNumber = this.thisMonth; // from today
    }
    else {
        mthNumber = this.month; // from requested month
        //mthNumber = mthCnt; // from a prior year
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
    TH.innerHTML=mthCnt+' records';
    TH.colSpan='2';
    TH = TR.insertCell(); TH.className='hdr uniq';
    TH.innerHTML='Unique<br>visitors';
    TH = TR.insertCell(); TH.className='hdr visits';
    TH.innerHTML='Number<br>of visits';
    TH = TR.insertCell(); TH.className='hdr pages';
    TH.innerHTML='Pages';
    TH = TR.insertCell(); TH.className='hdr hits';
    TH.innerHTML='Hits';
    TH = TR.insertCell(); TH.className='hdr bandwidth';
    TH.innerHTML='Bandwidth';
    
    
    var first = 1;
    var max = mthCnt;
    if (splitTable===1 || splitTable===2) {
        if (splitTable===1) {
            max = 6;
        }
        else {
            first = 7;
        }
    }
    
    for (var i=first;i<=max;i++) {
        var mthID = (i<10) ? '0'+(i) : i;
        var key=''+this.year+mthID;
        var yr=key.substr(0,4);
        var mth=key.substr(4,2);
        if (i>mthNumber) { //ignore months greater than requested month
            key='ignore';
        }        
        var data = sitedata[key] || {GENERAL:false, TIME:{totals:false}};
        var FETCH;

        var NoData = (i > mthNumber);
        var GENERAL = data.GENERAL || {TotalUnique:{count:0}, TotalVisits:{count:0}};
        var MTH = data.TIME.totals || {"pages":0,"hits":0,"bandwidth":0,
                            "notviewed":{"pages":0,"hits":0,"bandwidth":0}};
        
        TR = BODY.insertRow();

        if (i===first) {
            TD = TR.insertCell(); TD.className = 'lt';
            TD.innerHTML=yr;
            TD.rowSpan=12;
            if (splitTable===2) {
                TD.style.borderTop='1px solid white';
            }
        }        
        TD = TR.insertCell(); TD.className = 'lt';
        TD.innerHTML=mth;

        TD = TR.insertCell(); 
        FETCH = GENERAL.TotalUnique.count * 1;
        TD.innerHTML = NoData ? '' : FETCH._toLocalNo();
        this.SumUniq+=FETCH;

        TD = TR.insertCell(); 
        FETCH = GENERAL.TotalVisits.count * 1;
        TD.innerHTML = NoData ? '' : FETCH._toLocalNo();
        this.SumVisits+=FETCH;

        TD = TR.insertCell(); 
        FETCH = MTH.pages * 1;
        TD.innerHTML = NoData ? '' : FETCH._toLocalNo();
        this.SumPages+=FETCH;

        TD = TR.insertCell(); 
        FETCH = MTH.hits * 1;
        TD.innerHTML = NoData ? '' : FETCH._toLocalNo();
        this.SumHits+=FETCH

        TD = TR.insertCell(); 
        FETCH = (Math.round(((MTH.bandwidth) /1024/1024) * this.precision) / this.precision);
        TD.innerHTML=NoData ? '' : FETCH._toLocalNo(2);
        TD.innerHTML+=' MB';
        this.SumBandwidth+=FETCH

    }
    
    if (splitTable!==1) {        
        TR = FOOTER.insertRow();
        TR.style.backgroundColor = '#F0F0F0';

        TH = TR.insertCell();
        TH.innerHTML='Average'; TH.colSpan='2';
        TH = TR.insertCell();
        TH.innerHTML=( this.SumUniq / mthNumber )._toLocalNo();
        TH = TR.insertCell();
        TH.innerHTML=( this.SumVisits / mthNumber )._toLocalNo();
        TH = TR.insertCell();
        TH.innerHTML=( this.SumPages / mthNumber )._toLocalNo();
        TH = TR.insertCell();
        TH.innerHTML=( this.SumHits / mthNumber )._toLocalNo();
        TH = TR.insertCell();
        TH.innerHTML=(this.SumBandwidth / mthNumber)._toLocalNo(2);
        TH.innerHTML+=' MB';
        
        TR = FOOTER.insertRow();
        TR.style.backgroundColor = '#E0E0E0';

        TH = TR.insertCell();
        TH.innerHTML='Total'; TH.colSpan='2';
        TH = TR.insertCell();
        TH.innerHTML=this.SumUniq._toLocalNo();
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


