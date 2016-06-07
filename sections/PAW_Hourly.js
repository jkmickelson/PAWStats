var PAWStats = PAWStats || {};
if (!PAWStats.loaded) {
    alert('PLEASE ADD <script src="PAWStats.js"></script> TO YOUR CODE');
}

PAWStats.showHourlyAll = function () {
    myKeys = Object.keys(this.json);
    for (var i=0;i<myKeys.length;i++) {
        var site = myKeys[i];
        
        var t_chart = this.createHourlyChart(site, true);       
        document.body.appendChild(t_chart);
    }
}

PAWStats.showHourlySection = function (site, showTitle) {
    showTitle = (showTitle!==false); // default value is true
    if (showTitle) {
        document.writeln('<h2 Section>Hours (Averages)<btn onclick="PAWStats.collapseSection(this)">–</btn></h2>');
    }
    
    var section = document.createElement('Section-Frame');
    var t_chart = this.createHourlyChart(site);
    section.appendChild(t_chart);
    section.appendChild(document.createElement('br'));
    
    var responsive = (screen.width > 1190) ? 1 : 0; // because of poor iOS 'collapse' support
    var t_data_pt1 = this.createHourlyData(site, responsive);
    section.appendChild(t_data_pt1);
    if (responsive) {
        var t_data_pt2 = this.createHourlyData(site, 2);
        section.appendChild(t_data_pt2);
    }
    document.body.appendChild(section);
}

PAWStats.createHourlyChart = function (site, showCaption) {
    var sitedata=this.json[site][this.year+''+this.month];
    var SumPages=0, SumHits=0, SumBandwidth=0;
    var MaxPages=0, MaxHits=0, MaxBandwidth=0;
    
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

    var idsJson=sitedata.TIME.ids;
    
    // First, get Max and Totals to graph the proportional barchart 
    var first=0;
    for (var i=first;i<24;i++) {
        var hourID = (i<10) ? '0'+(i) : i;
        var key=''+hourID;
        var data=idsJson[key];
        var TIME = data || {pages:0, hits:0, bandwidth:0};
        
        FETCH = TIME.pages * 1;
        SumPages+=FETCH;
        MaxPages = (FETCH > MaxPages) ? FETCH : MaxPages;
        
        FETCH = TIME.hits * 1;
        SumHits+=FETCH;
        MaxHits = (FETCH > MaxHits) ? FETCH : MaxHits;
        
        FETCH = TIME.bandwidth * 1;
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
    
    var first=0;
    for (var i=first;i<24;i++) {
        var hourID = (i<10) ? '0'+(i) : i;
        var key=''+hourID;
        var data=idsJson[key];
        var height, CLASS;
        //this.debug('idsJson[' + key + '] = ' + data +', '+yr+'-'+mth+'-'+day);

        var TIME = data || {pages:0, hits:0, bandwidth:0};
        
        TD = FOOT_TR.insertCell(); 
        TD.innerHTML = hourID;

        TD = BODY_TR.insertCell(); 
        TD.innerHTML='';
        
        var bandwidthMB = (Math.round(((TIME.bandwidth) /1024/1024) * this.precision) / this.precision);
        
        _addBarColRatio(TD, 'pages', TIME.pages, MaxPages);
        _addBarColRatio(TD, 'hits', TIME.hits, MaxHits);
        _addBarColRatio(TD, 'bandwidth', bandwidthMB, MaxBandwidth);
    }

    TD = FOOT_TR.insertCell(); 
    TD.className = 'average';
    TD.innerHTML = 'Average';

    TD = BODY_TR.insertCell(); 
    TD.className = 'average';
    TD.innerHTML='';
    
    _addBarColRatio(TD, 'pages', (SumPages / 24), MaxPages);
    _addBarColRatio(TD, 'hits', (SumHits / 24), MaxHits);
    _addBarColRatio(TD, 'bandwidth', (SumBandwidth / 24), MaxBandwidth);

    return INLINE_TABLE;
}

PAWStats.createHourlyData = function (site, splitTable) {
    var sitedata=this.json[site][this.year+''+this.month];
    if (splitTable!==2) {
        this.SumVisits=0;
        this.SumPages=0;
        this.SumHits=0;
        this.SumBandwidth=0;
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
    TH.innerHTML='Hours';
    TH = TR.insertCell(); TH.className='hdr pages';
    TH.innerHTML='Pages';
    TH = TR.insertCell(); TH.className='hdr hits';
    TH.innerHTML='Hits';
    TH = TR.insertCell(); TH.className='hdr bandwidth';
    TH.innerHTML='Bandwidth';
    
    var idsJson=sitedata.TIME.ids;
    
    var first = 0;
    var max = 23;
    if (splitTable===1 || splitTable===2) {
        if (splitTable===1) {
            max = 11;
        }
        else {
            first = 12;
        }
    }
    
    for (var i=first;i<=max;i++) {
        var hourID = (i<10) ? '0'+(i) : i;
        var key=''+hourID;
        var data=idsJson[key];
        var FETCH;

        var TIME = data || {pages:0, hits:0, bandwidth:0};
        
        TR = BODY.insertRow();

        TD = TR.insertCell(); TD.className = 'lt';
        TD.innerHTML='&nbsp;'+hourID+':00 - '+hourID+':59&nbsp;';

        TD = TR.insertCell(); 
        FETCH = TIME.pages * 1;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumPages+=FETCH;

        TD = TR.insertCell(); 
        FETCH = TIME.hits * 1;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumHits+=FETCH;

        TD = TR.insertCell(); 
        FETCH = (TIME.bandwidth /1024/1024) ;
        TD.innerHTML = FETCH._toLocalNo(2);
        TD.innerHTML+=' MB';
        this.SumBandwidth+=FETCH;

    }
    
    if (splitTable!==1) {        
        TR = FOOTER.insertRow();
        TR.style.backgroundColor = '#F0F0F0';

        TH = TR.insertCell();
        TH.innerHTML='Average';
        TH = TR.insertCell();
        TH.innerHTML=( this.SumPages / 24 )._toLocalNo();
        TH = TR.insertCell();
        TH.innerHTML=( this.SumHits / 24 )._toLocalNo();
        TH = TR.insertCell();
        TH.innerHTML=(this.SumBandwidth / 24)._toLocalNo(2);
        TH.innerHTML+=' MB';
        
        TR = FOOTER.insertRow();
        TR.style.backgroundColor = '#E0E0E0';

        TH = TR.insertCell();
        TH.innerHTML='Total';
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


