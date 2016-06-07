var PAWStats = PAWStats || {};
if (!PAWStats.loaded) {
    alert('PLEASE ADD <script src="PAWStats.js"></script> TO YOUR CODE');
}

PAWStats.showDurationsAll = function () {
    myKeys = Object.keys(this.json);
    for (var i=0;i<myKeys.length;i++) {
        var site = myKeys[i];
        
        var t_chart = this.createDurationsMap(site, true);       
        document.body.appendChild(t_chart);
    }
}

PAWStats.showDurationsSection = function (site, showTitle) {
    showTitle = (showTitle!==false); // default value is true
    if (showTitle) {
        document.writeln('<h2 Section>Visit duration<btn onclick="PAWStats.collapseSection(this)">–</btn></h2>');
    }
    
    var section = document.createElement('Section-Frame');   
    var t_data = this.createDurationsData(site);
    section.appendChild(t_data);
    document.body.appendChild(section);
       
    sorttable.makeSortable(t_data); // does not support colspan, so adjust for it.
    //sorttable.innerSortFunction.apply(TH_SORT, []);               
}

PAWStats.createDurationsData = function (site) {
    var sitedata=this.json[site][this.year+''+this.month];

    this.SumVisits=0;
    this.SumRoboHits=0;
    this.SumHits=0;
    this.SumBandwidth=0;
    
    var INLINE_TABLE = document.createElement('table');
    var CAPTION = INLINE_TABLE.createCaption();
    var HEADER = INLINE_TABLE.createTHead();
    var BODY = INLINE_TABLE.createTBody();
    var FOOTER = INLINE_TABLE.createTFoot();
    var TR, TH, TD, TH_SORT;
    
    INLINE_TABLE.className  = 't-sortstripe';
    
    TR = HEADER.insertRow(); TR.style.fontWeight='bold';
    
    TH = TR.insertCell(); TH.className = 'hdr lt itemtitle  sorttable_alpha';
    TH.innerHTML='Time durations';
    TH = TR.insertCell(); TH.className='hdr visits';
    TH.innerHTML='Number of<br>visits';
    TH = TR.insertCell(); TH.className='hdr itemtitle sorttable_numeric';
    TH.innerHTML='Percent';
    
    var totalVisits=0;
    
    var idsJson=sitedata.SESSION.ids;
    for (var sessionID in idsJson) {
        var key=''+sessionID;
        var data=idsJson[key];
        var SESSION = data || {visits:0};
        totalVisits+=SESSION.visits * 1;
    }
    
    var orderedDurationKeys={'0s-30s':1,'30s-2mn':2,'2mn-5mn':3,'5mn-15mn':4,
                             '15mn-30mn':5,'30mn-1h':6,'1h+':7}
    //for (var sessionID in idsJson) {
    for (var sessionID in orderedDurationKeys) {
        var key=''+sessionID;
        var data=idsJson[key];
        var SESSION = data || {visits:0};
        var FETCH;
        
        TR = BODY.insertRow();

        TD = TR.insertCell(); TD.className = 'lt';
        TD.innerHTML=key;
        TD.setAttribute('sorttable_customkey',orderedDurationKeys[sessionID])

        TD = TR.insertCell(); 
        FETCH = SESSION.visits * 1;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumHits+=FETCH;

        TD = TR.insertCell(); 
        FETCH = FETCH / totalVisits * 100; // percentage
        TD.innerHTML = FETCH._toLocalNo(1);
        TD.innerHTML+=' %';
        this.SumBandwidth+=FETCH;
    }

    return INLINE_TABLE;
}


