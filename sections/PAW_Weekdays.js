var PAWStats = PAWStats || {};
if (!PAWStats.loaded) {
    alert('PLEASE ADD <script src="PAWStats.js"></script> TO YOUR CODE');
}

PAWStats.showWeekdayAll = function () {
    myKeys = Object.keys(this.json);
    for (var i=0;i<myKeys.length;i++) {
        var site = myKeys[i];
        
        var t_chart = this.createWeekdayChart(site, true);       
        document.body.appendChild(t_chart);
    }
}

PAWStats.showWeekdaySection = function (site, showTitle) {
    showTitle = (showTitle!==false); // default value is true
    if (showTitle) {
        document.writeln('<h2 Section>Days of week (Averages)<btn onclick="PAWStats.collapseSection(this)">–</btn></h2>');
    }
    
    var section = document.createElement('Section-Frame');
    var t_chart = this.createWeekdayChart(site);
    section.appendChild(t_chart);
    section.appendChild(document.createElement('br'));
    
    var responsive = (screen.width > 1190) ? 1 : 0; // because of poor iOS 'collapse' support
    responsive = false; //override
    
    var t_data_pt1 = this.createWeekdayData(site, responsive);
    section.appendChild(t_data_pt1);
    if (responsive) {
        var t_data_pt2 = this.createWeekdayData(site, 2);
        section.appendChild(t_data_pt2);
    }
    document.body.appendChild(section);
}

PAWStats.createWeekdayChart = function (site, showCaption) {
    var sitedata=this.json[site][this.year+''+this.month];
    var SumVisits=[0,0,0,0,0,0,0,0], SumPages=[0,0,0,0,0,0,0,0],
        SumHits=[0,0,0,0,0,0,0,0], SumBandwidth=[0,0,0,0,0,0,0,0];
    var DayOfWeekOccurence=[0,0,0,0,0,0,0,0];
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
    var DayTotalIdx = 7;
    var d=new Date();
    d.setYear(this.year); d.setMonth(this.month-1); d.setDate(1);    
    var dayOffset = ((-1)) + d.getDay();

    // First, get Max and Totals to graph the proportional barchart 
    var first=1;
    for (var i=first;i<=dayCnt;i++) {
        var dayID = (i<10) ? '0'+(i) : i;
        var key=''+this.year+this.month+dayID;
        var data=idsJson[key];
        var DAY = data || {pages:0, hits:0, bandwidth:0, visits: 0};

        var DayOfWeek = (i+dayOffset) % 7;
        if (data) {
            // do not increment if original data is not yet present
            DayOfWeekOccurence[DayOfWeek]++;
        }
                
        FETCH = DAY.visits * 1;
        SumVisits[DayOfWeek]+=FETCH;
        
        FETCH = DAY.pages * 1;
        SumPages[DayOfWeek]+=FETCH;
        
        FETCH = DAY.hits * 1;
        SumHits[DayOfWeek]+=FETCH;
        
        FETCH = DAY.bandwidth * 1;
        SumBandwidth[DayOfWeek]+=FETCH;
    }
    
    var avg;
    for (i=1;i<=7;i++) {
        DayOfWeek = i%7;

        avg = SumVisits[DayOfWeek] / DayOfWeekOccurence[DayOfWeek];
        MaxVisits = (avg > MaxVisits) ? avg : MaxVisits;
        
        avg = SumPages[DayOfWeek] / DayOfWeekOccurence[DayOfWeek]
        MaxPages = (avg > MaxPages) ? avg : MaxPages;
        
        avg = SumHits[DayOfWeek] / DayOfWeekOccurence[DayOfWeek]
        MaxHits = (avg > MaxHits) ? avg : MaxHits;
        
        avg = SumBandwidth[DayOfWeek] / DayOfWeekOccurence[DayOfWeek]
        MaxBandwidth = (avg > MaxBandwidth) ? avg : MaxBandwidth;
        
        // Convert to MB
        SumBandwidth[DayOfWeek]=(Math.round(((SumBandwidth[DayOfWeek]) /1024/1024) * this.precision) / this.precision);
    }
    // Convert to MB
    MaxBandwidth=(Math.round(((MaxBandwidth) /1024/1024) * this.precision) / this.precision);
    
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

    var first=1; // starting with Monday (0 for Sunday)
    var max = first + 6;
    for (var i=first;i<=max;i++) {
        var FETCH;
        var DayOfWeek = i%7;
        var DayOccurences = DayOfWeekOccurence[DayOfWeek];

        TD = FOOT_TR.insertCell(); 
        TD.innerHTML = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][DayOfWeek];

        TD = BODY_TR.insertCell(); 
        TD.innerHTML='';
        
        FETCH = SumVisits[DayOfWeek] / DayOccurences;
        FETCH = FETCH || 0;
        SumVisits[DayTotalIdx]+=FETCH;
        _addBarColRatio(TD, 'visits', FETCH, MaxVisits, true);
        
        FETCH = SumPages[DayOfWeek] / DayOccurences;
        FETCH = FETCH || 0;
        SumPages[DayTotalIdx]+=FETCH;
        _addBarColRatio(TD, 'pages', FETCH, MaxPages);
        
        FETCH = SumHits[DayOfWeek] / DayOccurences;
        FETCH = FETCH || 0;
        SumHits[DayTotalIdx]+=FETCH;
        _addBarColRatio(TD, 'hits', FETCH, MaxHits);
        
        FETCH = SumBandwidth[DayOfWeek] / DayOccurences;
        FETCH = FETCH || 0;
        SumBandwidth[DayTotalIdx]+=FETCH;
        _addBarColRatio(TD, 'bandwidth', FETCH, MaxBandwidth);
    }

    TD = FOOT_TR.insertCell(); 
    TD.className = 'average';
    TD.innerHTML = 'Average';

    TD = BODY_TR.insertCell(); 
    TD.className = 'average';
    TD.innerHTML='';
    
    _addBarColRatio(TD, 'visits', (SumVisits[DayTotalIdx] / 7), MaxVisits);
    _addBarColRatio(TD, 'pages', (SumPages[DayTotalIdx] / 7), MaxPages);
    _addBarColRatio(TD, 'hits', (SumHits[DayTotalIdx] / 7), MaxHits);
    _addBarColRatio(TD, 'bandwidth', (SumBandwidth[DayTotalIdx] / 7), MaxBandwidth);

    return INLINE_TABLE;
}

PAWStats.createWeekdayData = function (site, splitTable) {
    var sitedata=this.json[site][this.year+''+this.month];
    if (splitTable!==2) {
        this.SumVisits=[0,0,0,0,0,0,0,0];
        this.SumPages=[0,0,0,0,0,0,0,0];
        this.SumHits=[0,0,0,0,0,0,0,0];
        this.SumBandwidth=[0,0,0,0,0,0,0,0];
        this.DayOfWeekOccurence=[0,0,0,0,0,0,0,0];
    }    
    
    var dayCnt = this.lastDayOfReqMonth;
    var dayNumber; // divisor for running Average
    if (this.year==this.thisYear
        && this.month==this.thisMonth) {
        dayNumber = this.thisDay; // from today
    }
    else {
        dayNumber = dayCnt; // from some prior month
    }
    
    var d=new Date();
    d.setYear(this.year); d.setMonth(this.month-1); d.setDate(1);  
    var dayOffset = ((-1)) + d.getDay();
        
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
    TH.innerHTML='7 records';
    TH = TR.insertCell(); TH.className='hdr visits';
    TH.innerHTML='Number<br>of visits';
    TH = TR.insertCell(); TH.className='hdr pages';
    TH.innerHTML='Pages';
    TH = TR.insertCell(); TH.className='hdr hits';
    TH.innerHTML='Hits';
    TH = TR.insertCell(); TH.className='hdr bandwidth';
    TH.innerHTML='Bandwidth';
    
    var idsJson=sitedata.DAY.ids;
    
    // First, get Totals for each DayOfWeek
    var first=1;
    for (var i=first;i<=dayCnt;i++) {
        var dayID = (i<10) ? '0'+(i) : i;
        var key=''+this.year+this.month+dayID;
        var data=idsJson[key];
        var DAY = data || {pages:0, hits:0, bandwidth:0, visits: 0};
        var DayOfWeek = (i+dayOffset) % 7;
        
        if (data) {
            // do not increment if original data is not yet present
            this.DayOfWeekOccurence[DayOfWeek]++;
        }
        
        FETCH = DAY.visits * 1;
        this.SumVisits[DayOfWeek]+=FETCH;
        
        FETCH = DAY.pages * 1;
        this.SumPages[DayOfWeek]+=FETCH;
        
        FETCH = DAY.hits * 1;
        this.SumHits[DayOfWeek]+=FETCH;
        
        FETCH = DAY.bandwidth * 1;
        this.SumBandwidth[DayOfWeek]+=FETCH;
    }
    
    var first = 1; // 1 for Monday (0 for Sunday)
    var max = first + 6;
    if (splitTable===1 || splitTable===2) {
        if (splitTable===1) {
            max = first +2;
        }
        else {
            first += 3;
        }
    }

    var DayTotalIdx = 7;
    for (var i=first;i<=max;i++) {
        var FETCH;

        var DayOfWeek = i%7;
        var DayOccurences = this.DayOfWeekOccurence[DayOfWeek];
        
        TR = BODY.insertRow();

        TD = TR.insertCell(); TD.className = 'lt';
        TD.innerHTML=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i-1];

        TD = TR.insertCell(); 
        FETCH = this.SumVisits[DayOfWeek] / DayOccurences;
        FETCH = FETCH || 0;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumVisits[DayTotalIdx]+=FETCH;

        TD = TR.insertCell(); 
        FETCH = this.SumPages[DayOfWeek] / DayOccurences;
        FETCH = FETCH || 0;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumPages[DayTotalIdx]+=FETCH;

        TD = TR.insertCell(); 
        FETCH = this.SumHits[DayOfWeek] / DayOccurences;
        FETCH = FETCH || 0;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumHits[DayTotalIdx]+=FETCH;

        TD = TR.insertCell(); 
        FETCH = (Math.round(((this.SumBandwidth[DayOfWeek] / DayOccurences)
                 /1024/1024) * this.precision) / this.precision);
        FETCH = FETCH || 0;
        TD.innerHTML=FETCH._toLocalNo(2);
        TD.innerHTML+=' MB';
        this.SumBandwidth[DayTotalIdx]+=FETCH;
    }
    
    if (splitTable!==1) {        
        TR = FOOTER.insertRow();
        TR.style.backgroundColor = '#F0F0F0';

        TH = TR.insertCell();
        TH.innerHTML='Average';
        TH = TR.insertCell();
        TH.innerHTML=( this.SumVisits[DayTotalIdx] / 7 )._toLocalNo();
        TH = TR.insertCell();
        TH.innerHTML=( this.SumPages[DayTotalIdx] / 7 )._toLocalNo();
        TH = TR.insertCell();
        TH.innerHTML=( this.SumHits[DayTotalIdx] / 7 )._toLocalNo();
        TH = TR.insertCell();
        TH.innerHTML=(this.SumBandwidth[DayTotalIdx] / 7)._toLocalNo(2);
        TH.innerHTML+=' MB';        
    }
    
    return INLINE_TABLE;
}


