var PAWStats = PAWStats || {};
if (!PAWStats.loaded) {
    alert('PLEASE ADD <script src="PAWStats.js"></script> TO YOUR CODE');
}

PAWStats.showHostsAll = function () {
    myKeys = Object.keys(this.json);
    for (var i=0;i<myKeys.length;i++) {
        var site = myKeys[i];
        
        var t_chart = this.createHostsMap(site, true);       
        document.body.appendChild(t_chart);
    }
}

PAWStats.showHostsSection = function (site, showTitle) {
    showTitle = (showTitle!==false); // default value is true
    if (showTitle) {
        document.writeln('<h2 Section>Hosts<btn onclick="PAWStats.collapseSection(this)">–</btn></h2>');
    }
    
    var section = document.createElement('Section-Frame');   
    var t_data = this.createHostsData(site);
    section.appendChild(t_data);
    document.body.appendChild(section);
       
    sorttable.makeSortable(t_data); // does not support colspan, so adjust for it.
    //sorttable.innerSortFunction.apply(TH_SORT, []);               
}

PAWStats.createHostsData = function (site) {
    var sitedata=this.json[site][this.year+''+this.month];

    this.SumVisits=0;
    this.SumPages=0;
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
    TH.innerHTML='Top 30 Records'; // hardcoded in paw_data.php (for now)
    TH = TH_SORT = TR.insertCell(); TH.className='hdr pages';
    TH.innerHTML='Pages';
    TH = TR.insertCell(); TH.className='hdr hits';
    TH.innerHTML='Hits';
    TH = TR.insertCell(); TH.className='hdr bandwidth sorttable_numeric';
    TH.innerHTML='Bandwidth';
    TH = TR.insertCell(); TH.className='hdr itemtitle sorttable_numeric';
    TH.innerHTML='Last visit';
    
    var idsJson=sitedata.VISITOR.ids;
    
    for (var domainID in idsJson) {
        var key=''+domainID;
        var data=idsJson[key];
        var FETCH;

        var VISITOR = data || {pages:0, hits:0, bandwidth:0};
        
        TR = BODY.insertRow();

        TD = TR.insertCell(); TD.className = 'lt';
        TD.innerHTML=key;

        TD = TR.insertCell(); 
        FETCH = VISITOR.pages * 1;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumPages+=FETCH;

        TD = TR.insertCell(); 
        FETCH = VISITOR.hits * 1;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumHits+=FETCH;

        TD = TR.insertCell(); 
        FETCH = (VISITOR.bandwidth /1024/1024) ;
        TD.innerHTML = FETCH._toLocalNo(2);
        TD.innerHTML+=' MB';
        this.SumBandwidth+=FETCH;

        TD = TR.insertCell(); 
        FETCH = ''+VISITOR.lastvisit;
        var dt = new Date(FETCH.substr(0,4)+'-'+FETCH.substr(4,2)+'-'+FETCH.substr(6,2)
            +'T' + FETCH.substr(8,2) +':' + FETCH.substr(10,2))
        TD.innerHTML = dt.toLocaleString();

    }
        
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
    TH = TR.insertCell();
    TH.innerHTML='';
            
    return INLINE_TABLE;
}


