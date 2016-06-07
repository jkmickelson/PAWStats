var PAWStats = PAWStats || {};
if (!PAWStats.loaded) {
    alert('PLEASE ADD <script src="PAWStats.js"></script> TO YOUR CODE');
}
/*
PAWStats.showPagesURLAll = function () {
    myKeys = Object.keys(this.json);
    for (var i=0;i<myKeys.length;i++) {
        var site = myKeys[i];
        
        var t_chart = this.createPagesURLChart(site, true);       
        document.body.appendChild(t_chart);
    }
}
*/
PAWStats.showPagesURLSection = function (site, showTitle) {
    showTitle = (showTitle!==false); // default value is true
    if (showTitle) {
        document.writeln('<h2 Section>Pages-URL<btn onclick="PAWStats.collapseSection(this)">–</btn></h2>');
    }
    
    var section = document.createElement('Section-Frame');   
    var t_data = this.createPagesURLData(site);
    section.appendChild(t_data.scroller);
    document.body.appendChild(section);
       
    sorttable.makeSortable(t_data.inline); // does not support colspan, so adjust for it.
    //sorttable.innerSortFunction.apply(TH_SORT, []);               
}

PAWStats.createPagesURLData = function (site) {
    var sitedata=this.json[site][this.year+''+this.month];

    this.SumPages=0;
    this.SumBandwidth=0;
    this.SumEntry=0;
    this.SumExit=0;
    
    var INLINE_TABLE = document.createElement('table');
    var CAPTION = INLINE_TABLE.createCaption();
    var HEADER = INLINE_TABLE.createTHead();
    var BODY = INLINE_TABLE.createTBody();
    var FOOTER = INLINE_TABLE.createTFoot();
    var TR, TH, TD, TH_SORT;
    
    var is_iOS_Scroller = /Macintosh/.test(navigator.userAgent) && !window.MSStream;

    INLINE_TABLE.className  = 't-sortstripe';
    
    TR = HEADER.insertRow(); TR.style.fontWeight='bold';
    is_iOS_Scroller && ((TR.style.paddingLeft='0'));
    is_iOS_Scroller && ((TR.style.paddingRight='0'));
    
    TH = TR.insertCell(); TH.className = 'elliphdr lt itemtitle sorttable_alpha';
    TH.innerHTML='URLS';
    TH = TR.insertCell(); TH.className='hdr pages';
    TH.innerHTML='Viewed';
    TH = TH_SORT = TR.insertCell(); TH.className='hdr robohits sorttable_numeric';
    TH.innerHTML='Average<br>size';
    TH = TR.insertCell(); TH.className='hdr hits sorttable_numeric';
    TH.innerHTML='Entry';
    TH = TR.insertCell(); TH.className='hdr hits sorttable_numeric';
    TH.innerHTML='Exit';

    var idsJson=sitedata.SIDER.ids;
    if (!idsJson) {
        idsJson={};
        idsJson['(empty)'] = {pages:0, bandwidth:0, entry:0, exit:0};
    }

    for (var urlID in idsJson) {
        var key=''+urlID;
        var data=idsJson[key];
        var FETCH;

        var SIDER = data || {pages:0, bandwidth:0, entry:0, exit:0};
        
        TR = BODY.insertRow();

        TD = TR.insertCell(); TD.className = 'lt';
        // workaround for iOS (doesn't support TD.style.display='block')
        // so... add a div wrapper.
        var txt='<div class="ellipsis">';
        txt+='<a title="'+key+'" href="'+site+key+'">'+key+'</a>';
        txt+='</div>';
        TD.innerHTML=txt;

        TD = TR.insertCell(); TD.className = 'hdr';
        FETCH = SIDER.pages * 1;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumPages+=FETCH;

        TD = TR.insertCell(); TD.className = 'hdr';
        FETCH = (SIDER.bandwidth /1024/1024) / SIDER.pages;
        FETCH = FETCH || 0;
        TD.innerHTML = FETCH._toLocalNo(4);
        TD.innerHTML+=' MB';
        this.SumBandwidth+=FETCH;

        TD = TR.insertCell(); TD.className = 'hdr';
        FETCH = SIDER.entry * 1;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumEntry+=FETCH;

        TD = TR.insertCell(); TD.className = 'hdr';
        FETCH = SIDER.exit * 1;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumExit+=FETCH;
    }
        
    TR = FOOTER.insertRow();
    TR.style.backgroundColor = '#E0E0E0';
    is_iOS_Scroller && ((TR.style.paddingLeft='0'));
    is_iOS_Scroller && ((TR.style.paddingRight='0'));

    TH = TR.insertCell(); TH.className = 'elliphdr';
    TH.innerHTML='Total';
    TH = TR.insertCell(); TH.className = 'ftr';
    TH.innerHTML=this.SumPages._toLocalNo();
    TH = TR.insertCell(); TH.className = 'ftr';
    TH.innerHTML=this.SumBandwidth._toLocalNo(2);
    TH.innerHTML+=' MB';
    TH = TR.insertCell(); TH.className = 'ftr';
    TH.innerHTML=this.SumEntry._toLocalNo();
    TH = TR.insertCell(); TH.className = 'ftr';
    TH.innerHTML=this.SumExit._toLocalNo();
            
    var SCROLLER_TABLE = document.createElement('table-scroller');
    var TABLE_INSOLE = document.createElement('table-insole');
    SCROLLER_TABLE.appendChild(TABLE_INSOLE);
    TABLE_INSOLE.appendChild(INLINE_TABLE);
    
    return {scroller:SCROLLER_TABLE, inline:INLINE_TABLE};
}


