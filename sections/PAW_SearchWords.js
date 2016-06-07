var PAWStats = PAWStats || {};
if (!PAWStats.loaded) {
    alert('PLEASE ADD <script src="PAWStats.js"></script> TO YOUR CODE');
}
/*
PAWStats.showSearchwordsAll = function () {
    myKeys = Object.keys(this.json);
    for (var i=0;i<myKeys.length;i++) {
        var site = myKeys[i];
        
        var t_chart = this.createSearchwordsChart(site, true);       
        document.body.appendChild(t_chart);
    }
}
*/
PAWStats.showSearchwordsSection = function (site, showTitle) {
    showTitle = (showTitle!==false); // default value is true
    if (showTitle) {
        document.writeln('<h2 Section>Search Keyphrases<btn onclick="PAWStats.collapseSection(this)">–</btn></h2>');
    }
    
    var section = document.createElement('Section-Frame');   
    var t_data = this.createSearchwordsData(site);
    section.appendChild(t_data.scroller);
    document.body.appendChild(section);
       
    sorttable.makeSortable(t_data.inline); // does not support colspan, so adjust for it.
    sorttable.innerSortFunction.apply(t_data.sortField, []);               
}

PAWStats.createSearchwordsData = function (site) {
    var sitedata=this.json[site][this.year+''+this.month];

    var INLINE_TABLE = document.createElement('table');
    var CAPTION = INLINE_TABLE.createCaption();
    var HEADER = INLINE_TABLE.createTHead();
    var BODY = INLINE_TABLE.createTBody();
    var FOOTER = INLINE_TABLE.createTFoot();
    var TR, TH, TD, TH_SORT;
    
    var idsJson=sitedata.SEARCHWORDS.ids;
    var defaultData = {count:0};
        
    var SUM = this.cloneObject(defaultData);
    var COUNT = 0;
    
    // First, get Totals for percentages
    for (var dataID in idsJson) {
        var key=''+dataID;
        var data=idsJson[key];
        var JSONDATA = data || defaultData;

        // sum for each data field
        for (var fieldID in defaultData) {
            FETCH = JSONDATA[fieldID] * 1;
            SUM[fieldID]+=FETCH;
        }        
        COUNT++;     
    }
    
    INLINE_TABLE.className  = 't-sortstripe';
    
    TR = HEADER.insertRow(); TR.style.fontWeight='bold';
    
    TH = TR.insertCell(); TH.className = 'elliphdr lt itemtitle  sorttable_alpha';
    TH.innerHTML='Phrases';
    TH = TH_SORT = TR.insertCell(); TH.className='hdr hits';
    TH.innerHTML='Hits';
    TH = TR.insertCell(); TH.className='hdr sorttable_numeric';
    TH.innerHTML='Percent';

    var idsJson=sitedata.SEARCHWORDS.ids;
    if (!COUNT) {
        idsJson={};
        idsJson['(empty)'] = this.cloneObject(defaultData);
    }
    
    for (var dataID in idsJson) {
        var key=''+dataID;
        var data=idsJson[key];
        var FETCH;

        var SEARCHWORDS = data || {count:0};
        
        TR = BODY.insertRow();

        TD = TR.insertCell(); TD.className = 'lt';
        // workaround for iOS (doesn't support TD.style.display='block')
        // so... add a div wrapper.
        var cleanKey=key.replace(/\+/g, ' ');
        var txt='<div class="ellipsis">';
        txt+='<span title="'+cleanKey+'">'+cleanKey+'</span>';
        txt+='</div>';
        TD.innerHTML=txt;

        TD = TR.insertCell(); TD.className = 'hdr';
        FETCH = SEARCHWORDS.count * 1;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumHits+=FETCH;
        
        TD = TR.insertCell(); TD.className = 'hdr';
        FETCH = SEARCHWORDS.count * 1 / SUM.count *100;
        FETCH = FETCH || 0;
        TD.innerHTML = FETCH._toLocalNo(1);
        TD.innerHTML+=' %';
    }
        
    TR = FOOTER.insertRow();
    TR.style.backgroundColor = '#E0E0E0';

    TH = TR.insertCell(); TH.className = 'elliphdr';
    TH.innerHTML='Total';
    TH = TR.insertCell(); TH.className = 'ftr';
    TH.innerHTML=SUM.count._toLocalNo();
    TH = TR.insertCell(); TH.className = 'ftr';
    TH.innerHTML='100.0 %';
            
    var SCROLLER_TABLE = document.createElement('table-scroller');
    var TABLE_INSOLE = document.createElement('table-insole');
    SCROLLER_TABLE.appendChild(TABLE_INSOLE);
    TABLE_INSOLE.appendChild(INLINE_TABLE);
    
    return {scroller:SCROLLER_TABLE, inline:INLINE_TABLE, 'sortField':TH_SORT};
}


