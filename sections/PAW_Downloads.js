var PAWStats = PAWStats || {};
if (!PAWStats.loaded) {
    alert('PLEASE ADD <script src="PAWStats.js"></script> TO YOUR CODE');
}
/*
PAWStats.showDownloadsAll = function () {
    myKeys = Object.keys(this.json);
    for (var i=0;i<myKeys.length;i++) {
        var site = myKeys[i];
        
        var t_chart = this.createDownloadsChart(site, true);       
        document.body.appendChild(t_chart);
    }
}
*/
PAWStats.showDownloadsSection = function (site, showTitle) {
    showTitle = (showTitle!==false); // default value is true
    if (showTitle) {
        document.writeln('<h2 Section>Downloads<btn onclick="PAWStats.collapseSection(this)">–</btn></h2>');
    }
    
    var section = document.createElement('Section-Frame');   
    var t_data = this.createDownloadsData(site);
    section.appendChild(t_data.scroller);
    document.body.appendChild(section);
       
    sorttable.makeSortable(t_data.inline); // does not support colspan, so adjust for it.
    sorttable.innerSortFunction.apply(t_data.sortField, []);               
}

PAWStats.createDownloadsData = function (site) {
    var sitedata=this.json[site][this.year+''+this.month];

    var INLINE_TABLE = document.createElement('table');
    var CAPTION = INLINE_TABLE.createCaption();
    var HEADER = INLINE_TABLE.createTHead();
    var BODY = INLINE_TABLE.createTBody();
    var FOOTER = INLINE_TABLE.createTFoot();
    var TR, TH, TD, TH_SORT;
    
    var idsJson=sitedata.DOWNLOADS.ids;
    var defaultData = {hits:0, partial206:0, bandwidth:0};
        
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
    TH.innerHTML='Files';
    TH = TH_SORT = TR.insertCell(); TH.className='hdr hits';
    TH.innerHTML='Hits';
    TH = TR.insertCell(); TH.className='hdr hits';
    TH.innerHTML='206 Hits';
    TH = TR.insertCell(); TH.className='hdr robohits sorttable_numeric';
    TH.innerHTML='Bandwidth';
    TH = TR.insertCell(); TH.className='hdr robohits sorttable_numeric';
    TH.innerHTML='Average<br>size';

    var idsJson=sitedata.DOWNLOADS.ids;
    if (!COUNT) {
        idsJson={};
        idsJson['(empty)'] = this.cloneObject(defaultData);
    }
    
    for (var dataID in idsJson) {
        var key=''+dataID;
        var data=idsJson[key];
        var FETCH;

        var ITEM = data || {hits:0, bandwidth:0};
        TR = BODY.insertRow();

        TD = TR.insertCell(); TD.className = 'lt';
        // workaround for iOS (doesn't support TD.style.display='block')
        // so... add a div wrapper.
        var txt='<div class="ellipsis">';
        txt+='<span title="'+key+'">'+key+'</span>';
        txt+='</div>';
        TD.innerHTML=txt;

        TD = TR.insertCell(); TD.className = 'hdr';
        FETCH = ITEM.hits * 1;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumHits+=FETCH;
        
        TD = TR.insertCell(); TD.className = 'hdr';
        FETCH = ITEM.partial206;
        TD.innerHTML = FETCH._toLocalNo();

        TD = TR.insertCell(); TD.className = 'hdr';
        FETCH = (ITEM.bandwidth /1024/1024);
        FETCH = FETCH || 0;
        TD.innerHTML = FETCH._toLocalNo(2);
        TD.innerHTML+=' MB';

        TD = TR.insertCell(); TD.className = 'hdr';
        FETCH = (ITEM.bandwidth /1024/1024) / ITEM.hits;
        FETCH = FETCH || 0;
        TD.innerHTML = FETCH._toLocalNo(4);
        TD.innerHTML+=' MB';
    }
        
    TR = FOOTER.insertRow();
    TR.style.backgroundColor = '#E0E0E0';

    TH = TR.insertCell(); TH.className = 'elliphdr';
    TH.innerHTML='Total';
    TH = TR.insertCell(); TH.className = 'ftr';
    TH.innerHTML=SUM.hits._toLocalNo();
    TH = TR.insertCell(); TH.className = 'ftr';
    TH.innerHTML=SUM.partial206._toLocalNo();
    TH = TR.insertCell(); TH.className = 'ftr';
    FETCH = (SUM.bandwidth /1024/1024);
    TH.innerHTML = FETCH._toLocalNo(2);
    TH.innerHTML+=' MB';
    TH = TR.insertCell(); TH.className = 'ftr';
    FETCH = (SUM.bandwidth /1024/1024) / SUM.hits;   
    TH.innerHTML = FETCH._toLocalNo(4);
    TH.innerHTML+=' MB';
            
    var SCROLLER_TABLE = document.createElement('table-scroller');
    var TABLE_INSOLE = document.createElement('table-insole');
    SCROLLER_TABLE.appendChild(TABLE_INSOLE);
    TABLE_INSOLE.appendChild(INLINE_TABLE);
    
    return {scroller:SCROLLER_TABLE, inline:INLINE_TABLE, 'sortField':TH_SORT};
}


