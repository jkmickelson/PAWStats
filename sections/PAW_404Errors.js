var PAWStats = PAWStats || {};
if (!PAWStats.loaded) {
    alert('PLEASE ADD <script src="PAWStats.js"></script> TO YOUR CODE');
}
/*
PAWStats.show404ErrorsAll = function () {
    myKeys = Object.keys(this.json);
    for (var i=0;i<myKeys.length;i++) {
        var site = myKeys[i];
        
        var t_chart = this.create404ErrorsChart(site, true);       
        document.body.appendChild(t_chart);
    }
}
*/
PAWStats.show404ErrorsSection = function (site, showTitle) {
    showTitle = (showTitle!==false); // default value is true
    if (showTitle) {
        document.writeln('<h2 Section>HTTP code 404 (Requested but not found)<btn onclick="PAWStats.collapseSection(this)">–</btn></h2>');
    }
    
    var section = document.createElement('Section-Frame');   
    var t_data = this.create404ErrorsData(site);
    section.appendChild(t_data.scroller);
    document.body.appendChild(section);
       
    sorttable.makeSortable(t_data.inline); // does not support colspan, so adjust for it.
    sorttable.innerSortFunction.apply(t_data.sortField, []);               
}

PAWStats.create404ErrorsData = function (site) {
    var sitedata=this.json[site][this.year+''+this.month];

    var INLINE_TABLE = document.createElement('table');
    var CAPTION = INLINE_TABLE.createCaption();
    var HEADER = INLINE_TABLE.createTHead();
    var BODY = INLINE_TABLE.createTBody();
    var FOOTER = INLINE_TABLE.createTFoot();
    var TR, TH, TD, TH_SORT;
    
    var idsJson=sitedata.SIDER_404.ids;
    var defaultData = {hits:0, bandwidth:0, lasturlref:''};
        
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
    TH.innerHTML='URL';
    TH = TH_SORT = TR.insertCell(); TH.className='hdr hits';
    TH.innerHTML='Hits';
    TH = TR.insertCell(); TH.className='hdr sorttable_numeric';
    TH.innerHTML='Percent';
    TH = TR.insertCell(); TH.className='elliphdr pages sorttable_numeric';
    TH.innerHTML='Referrers';

    var idsJson=sitedata.SIDER_404.ids;
    if (!COUNT) {
        idsJson={};
        idsJson['(empty)'] = this.cloneObject(defaultData);
    }
    
    for (var dataID in idsJson) {
        var key=''+dataID;
        var data=idsJson[key];
        var FETCH;

        var SIDER_404 = data || {hits:0, bandwidth:0};
        TR = BODY.insertRow();

        TD = TR.insertCell(); TD.className = 'lt';
        // workaround for iOS (doesn't support TD.style.display='block')
        // so... add a div wrapper.
        var txt='<div class="ellipsis">';
        txt+='<span title="'+key+'">'+key+'</span>';
        txt+='</div>';
        TD.innerHTML=txt;

        TD = TR.insertCell(); TD.className = 'hdr';
        FETCH = SIDER_404.hits * 1;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumHits+=FETCH;
        
        TD = TR.insertCell(); TD.className = 'hdr';
        FETCH = SIDER_404.hits * 1 / SUM.hits *100;
        FETCH = FETCH || 0;
        TD.innerHTML = FETCH._toLocalNo(1);
        TD.innerHTML+=' %';
        
        TD = TR.insertCell(); TD.className = 'hdr';
        // workaround for iOS (doesn't support TD.style.display='block')
        // so... add a div wrapper.
        txt='<div class="ellipsis">';
        txt+='<span title="'+SIDER_404.lasturlref+'">'+SIDER_404.lasturlref+'</span>';
        txt+='</div>';
        TD.innerHTML=txt;
    }
        
    TR = FOOTER.insertRow();
    TR.style.backgroundColor = '#E0E0E0';

    TH = TR.insertCell(); TH.className = 'elliphdr';
    TH.innerHTML='Total';
    TH = TR.insertCell(); TH.className = 'ftr';
    TH.innerHTML=SUM.hits._toLocalNo();
    TH = TR.insertCell(); TH.className = 'ftr';
    TH.innerHTML='100.0 %';
    TH = TR.insertCell(); TH.className = 'elliphdr';
    TH.innerHTML = '';
            
    var SCROLLER_TABLE = document.createElement('table-scroller');
    var TABLE_INSOLE = document.createElement('table-insole');
    SCROLLER_TABLE.appendChild(TABLE_INSOLE);
    TABLE_INSOLE.appendChild(INLINE_TABLE);
    
    return {scroller:SCROLLER_TABLE, inline:INLINE_TABLE, 'sortField':TH_SORT};
}


