var PAWStats = PAWStats || {};
if (!PAWStats.loaded) {
    alert('PLEASE ADD <script src="PAWStats.js"></script> TO YOUR CODE');
}

PAWStats.showBrowsersAll = function () {
    myKeys = Object.keys(this.json);
    for (var i=0;i<myKeys.length;i++) {
        var site = myKeys[i];
        
        var t_chart = this.createBrowsersChart(site, true);       
        document.body.appendChild(t_chart);
    }
}

PAWStats.showBrowsersSection = function (site, showTitle) {
    showTitle = (showTitle!==false); // default value is true
    if (showTitle) {
        document.writeln('<h2 Section>Browsers<btn onclick="PAWStats.collapseSection(this)">–</btn></h2>');
    }
    
    var section = document.createElement('Section-Frame');
    var t_chart = this.createBrowsersChart(site);
    section.appendChild(t_chart);
    section.appendChild(document.createElement('br'));
    
    var t_data = this.createBrowsersData(site);
    section.appendChild(t_data.table);
    document.body.appendChild(section);
    
    sorttable.makeSortable(t_data.table); // does not support colspan, so adjust for it.
    sorttable.innerSortFunction.apply(t_data.sortField, []);               
}

PAWStats.createBrowsersChart = function (site, showCaption) {
    var sitedata=this.json[site][this.year+''+this.month];

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

    var idsJson=sitedata.BROWSER.ids;
    var defaultData = {hits:0, pages:0};
    
    var SUM = this.cloneObject(defaultData);
    var MAX = this.cloneObject(defaultData);
    var SectionSum = {};
    
    // First, get Max and Totals to graph the proportional barchart 
    for (var itemID in idsJson) {
        var key=''+itemID;
        var data=idsJson[key];
        var ITEM = data || defaultData;
        var itemName = itemID.replace(/([a-zA-Z]+)(.*)/, "$1");
        if (!SectionSum[itemName]) {
            SectionSum[itemName] = this.cloneObject(defaultData);
        }

        // sum and max for each data field
        for (var fieldID in defaultData) {
            FETCH = ITEM[fieldID] * 1;
            SUM[fieldID]+=FETCH;
            SectionSum[itemName][fieldID]+=FETCH;
            
            FETCH = SectionSum[itemName][fieldID];
            MAX[fieldID] = (FETCH > MAX[fieldID]) ? FETCH : MAX[fieldID];        
        }        
    }
    
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

    var sortable = [];
    for (var itemID in SectionSum) {
        sortable.push([itemID, SectionSum[itemID]])
    }
    sortable.sort(function(a, b) {return b[1].hits - a[1].hits})
        
    for (var itemArray in sortable) {
        var itemID = sortable[itemArray][0];
        var key=''+itemID;
        var data=SectionSum[key];
        var height, CLASS;

        var ITEM = data || defaultData;
        
        TD = FOOT_TR.insertCell(); 
        var itemName = itemID.replace(/([a-zA-Z]+)(.*)/, "$1");
        TD.innerHTML=itemName;

        TD = BODY_TR.insertCell(); 
        TD.innerHTML='';

        _addBarColRatio(TD, 'pages', ITEM.pages, MAX.pages);
        _addBarColRatio(TD, 'hits', ITEM.hits, MAX.hits);
    }

    return INLINE_TABLE;
}

PAWStats.createBrowsersData = function (site) {
    var sitedata=this.json[site][this.year+''+this.month];
    
    var INLINE_TABLE = document.createElement('table');
    var CAPTION = INLINE_TABLE.createCaption();
    var HEADER = INLINE_TABLE.createTHead();
    var BODY = INLINE_TABLE.createTBody();
    var FOOTER = INLINE_TABLE.createTFoot();
    var TR, TH, TD, TH_SORT;
    
    var idsJson=sitedata.BROWSER.ids;
    var defaultData = {hits:0, pages:0};
        
    var SUM = this.cloneObject(defaultData);
    var MAX = this.cloneObject(defaultData);
    var SectionSum = {};
    
    // First, get Totals for percentages
    for (var itemID in idsJson) {
        var key=''+itemID;
        var data=idsJson[key];
        var ITEM = data || defaultData;
        ITEM.page = ITEM.pages || 0;
        
        var itemName = itemID.replace(/([a-zA-Z]+)(.*)/, "$1");
        if (!SectionSum[itemName]) {
            SectionSum[itemName] = this.cloneObject(defaultData);
        }

        // sum for each data field
        for (var fieldID in defaultData) {
            FETCH = ITEM[fieldID] * 1;
            SUM[fieldID]+=FETCH;
            SectionSum[itemName][fieldID]+=FETCH;
        }        
    }
    SUM.pages = SUM.pages || 0; // override NaN
            
    INLINE_TABLE.className  = 't-sortstripe';
    
    TR = HEADER.insertRow(); TR.style.fontWeight='bold';
    
    TH = TR.insertCell(); TH.className = 'hdr lt itemtitle sorttable_alphai';
    TH.innerHTML='File type';
    TH = TR.insertCell(); TH.className='hdr pages';
    TH.innerHTML='Pages';
    TH = TR.insertCell(); TH.className='hdr sorttable_numeric';
    TH.innerHTML='Percent';
    TH = TH_SORT = TR.insertCell(); TH.className='hdr hits sorttable_numeric';
    TH.innerHTML='Hits';
    TH = TR.insertCell(); TH.className='hdr sorttable_numeric';
    TH.innerHTML='Percent';
    
    for (var itemID in SectionSum) {
        var key=''+itemID;
        var data=SectionSum[key];
        var FETCH;

        var ITEM = data || defaultData;
        ITEM.pages = ITEM.pages || 0;
        
        TR = BODY.insertRow();

        TD = TR.insertCell(); TD.className = 'lt';
        var itemName = itemID.replace(/([a-zA-Z]+)(.*)/, "$1");
        itemName = itemName.replace(/(?:^|\s)\w/g, function(match) {
            return match.toUpperCase();
        });
        itemName = (itemName == 'Msie') ? 'MS Internet Explorer' : itemName
        TD.innerHTML=itemName;

        TD = TR.insertCell(); 
        FETCH = ITEM.pages * 1;
        TD.innerHTML = FETCH._toLocalNo();
        
        TD = TR.insertCell(); 
        FETCH = ITEM.pages * 1 / SUM.pages *100;
        FETCH = FETCH || 0; // override NaN
        TD.innerHTML = FETCH._toLocalNo(1);
        TD.innerHTML+=' %';

        TD = TR.insertCell(); 
        FETCH = ITEM.hits * 1;
        TD.innerHTML = FETCH._toLocalNo();
        
        TD = TR.insertCell(); 
        FETCH = ITEM.hits * 1 / SUM.hits *100;
        TD.innerHTML = FETCH._toLocalNo(1);
        TD.innerHTML+=' %';
    }
    
    TR = FOOTER.insertRow();
    TR.style.backgroundColor = '#E0E0E0';

    TH = TR.insertCell();
    TH.innerHTML='Total';
    TH = TR.insertCell();
    TH.innerHTML=SUM.pages._toLocalNo();
    TH = TR.insertCell();
    TH.innerHTML='100.0 %';
    TH = TR.insertCell();
    TH.innerHTML=SUM.hits._toLocalNo();
    TH = TR.insertCell();
    TH.innerHTML='100.0 %';
    
    return {'table':INLINE_TABLE,'sortField':TH_SORT};
}


