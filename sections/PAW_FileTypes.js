var PAWStats = PAWStats || {};
if (!PAWStats.loaded) {
    alert('PLEASE ADD <script src="PAWStats.js"></script> TO YOUR CODE');
}

PAWStats.showFiletypesAll = function () {
    myKeys = Object.keys(this.json);
    for (var i=0;i<myKeys.length;i++) {
        var site = myKeys[i];
        
        var t_chart = this.createFiletypesChart(site, true);       
        document.body.appendChild(t_chart);
    }
}

PAWStats.showFiletypesSection = function (site, showTitle) {
    showTitle = (showTitle!==false); // default value is true
    if (showTitle) {
        document.writeln('<h2 Section>File types<btn onclick="PAWStats.collapseSection(this)">–</btn></h2>');
    }
    
    var section = document.createElement('Section-Frame');
    var t_chart = this.createFiletypesChart(site);
    section.appendChild(t_chart);
    section.appendChild(document.createElement('br'));
    
    var t_data = this.createFiletypesData(site);
    section.appendChild(t_data.table);
    document.body.appendChild(section);
    
    sorttable.makeSortable(t_data.table); // does not support colspan, so adjust for it.
    sorttable.innerSortFunction.apply(t_data.sortField, []);               
}

PAWStats.createFiletypesChart = function (site, showCaption) {
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

    var idsJson=sitedata.FILETYPES.ids;
    var defaultData = {hits:0, bandwidth:0, nocomp:0, withcomp:0};
    
    var SUM = this.cloneObject(defaultData);
    var MAX = this.cloneObject(defaultData);
    
    // First, get Max and Totals to graph the proportional barchart 
    for (var filetypeID in idsJson) {
        var key=''+filetypeID;
        var data=idsJson[key];
        var FILETYPES = data || defaultData;

        // sum and max for each data field
        for (var fieldID in defaultData) {
            FETCH = FILETYPES[fieldID] * 1;
            SUM[fieldID]+=FETCH;
            MAX[fieldID] = (FETCH > MAX[fieldID]) ? FETCH : MAX[fieldID];        
        }        
    }
    
    // Convert to MB
    MAX.bandwidth=(Math.round(((MAX.bandwidth) /1024/1024) * this.precision) / this.precision);
    SUM.bandwidth=(Math.round(((SUM.bandwidth) /1024/1024) * this.precision) / this.precision);
    
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
    for (var itemID in idsJson) {
        sortable.push([itemID, idsJson[itemID]])
    }
    sortable.sort(function(a, b) {return b[1].hits - a[1].hits})
        
    for (var itemArray in sortable) {
        var filetypeID = sortable[itemArray][0];
        var key=''+filetypeID;
        var data=idsJson[key];
        var height, CLASS;
        //this.debug('idsJson[' + key + '] = ' + data +', '+yr+'-'+mth+'-'+day);

        var FILETYPES = data || defaultData;
        
        TD = FOOT_TR.insertCell(); 
        TD.innerHTML = filetypeID;

        TD = BODY_TR.insertCell(); 
        TD.innerHTML='';
        
        var bandwidthMB = (Math.round(((FILETYPES.bandwidth) /1024/1024) * this.precision) / this.precision);

        _addBarColRatio(TD, 'hits', FILETYPES.hits, MAX.hits);
        _addBarColRatio(TD, 'bandwidth', bandwidthMB, MAX.bandwidth);
    }

    return INLINE_TABLE;
}

PAWStats.createFiletypesData = function (site) {
    var sitedata=this.json[site][this.year+''+this.month];
    
    var INLINE_TABLE = document.createElement('table');
    var CAPTION = INLINE_TABLE.createCaption();
    var HEADER = INLINE_TABLE.createTHead();
    var BODY = INLINE_TABLE.createTBody();
    var FOOTER = INLINE_TABLE.createTFoot();
    var TR, TH, TD, TH_SORT;
    
    var idsJson=sitedata.FILETYPES.ids;
    var defaultData = {hits:0, bandwidth:0, nocomp:0, withcomp:0};
        
    var SUM = this.cloneObject(defaultData);
    var MAX = this.cloneObject(defaultData);
    
    // First, get Max and Totals to graph the proportional barchart 
    for (var filetypeID in idsJson) {
        var key=''+filetypeID;
        var data=idsJson[key];
        var FILETYPES = data || defaultData;

        // sum and max for each data field
        for (var fieldID in defaultData) {
            FETCH = FILETYPES[fieldID] * 1;
            SUM[fieldID]+=FETCH;
            MAX[fieldID] = (FETCH > MAX[fieldID]) ? FETCH : MAX[fieldID];        
        }        
    }
    
    // Convert to MB
    MAX.bandwidth=(Math.round(((MAX.bandwidth) /1024/1024) * this.precision) / this.precision);
    SUM.bandwidth=(Math.round(((SUM.bandwidth) /1024/1024) * this.precision) / this.precision);
        
    INLINE_TABLE.className  = 't-sortstripe';
    
    TR = HEADER.insertRow(); TR.style.fontWeight='bold';
    
    TH = TR.insertCell(); TH.className = 'hdr lt itemtitle sorttable_alphai';
    TH.innerHTML='File type';
    TH = TH_SORT = TR.insertCell(); TH.className='hdr hits';
    TH.innerHTML='Hits';
    TH = TR.insertCell(); TH.className='hdr sorttable_numeric';
    TH.innerHTML='Percent';
    TH = TR.insertCell(); TH.className='hdr bandwidth sorttable_numeric';
    TH.innerHTML='Bandwidth';
    TH = TR.insertCell(); TH.className='hdr sorttable_numeric';
    TH.innerHTML='Percent';
    
    for (var filetypeID in idsJson) {
        var key=''+filetypeID;
        var data=idsJson[key];
        var FETCH;

        var FILETYPES = data || defaultData;
        
        TR = BODY.insertRow();

        TD = TR.insertCell(); TD.className = 'lt';
        TD.innerHTML=filetypeID;

        TD = TR.insertCell(); 
        FETCH = FILETYPES.hits * 1;
        TD.innerHTML = FETCH._toLocalNo();
        
        TD = TR.insertCell(); 
        FETCH = FILETYPES.hits * 1 / SUM.hits *100;
        TD.innerHTML = FETCH._toLocalNo(1);
        TD.innerHTML+=' %';

        TD = TR.insertCell(); 
        FETCH = (FILETYPES.bandwidth /1024/1024) ;
        TD.innerHTML = FETCH._toLocalNo(2);
        TD.innerHTML+=' MB';

        TD = TR.insertCell(); 
        FETCH = (FILETYPES.bandwidth /1024/1024) / SUM.bandwidth *100;
        TD.innerHTML = FETCH._toLocalNo(1);
        TD.innerHTML+=' %';

    }
    
    TR = FOOTER.insertRow();
    TR.style.backgroundColor = '#E0E0E0';

    TH = TR.insertCell();
    TH.innerHTML='Total';
    TH = TR.insertCell();
    TH.innerHTML=SUM.hits._toLocalNo();
    TH = TR.insertCell();
    TH.innerHTML='100.0 %';
    TH = TR.insertCell();
    TH.innerHTML=SUM.bandwidth._toLocalNo(2);
    TH.innerHTML+=' MB';       
    TH = TR.insertCell();
    TH.innerHTML='100.0 %';
    
    return {'table':INLINE_TABLE,'sortField':TH_SORT};
}


