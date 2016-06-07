var PAWStats = PAWStats || {};
if (!PAWStats.loaded) {
    alert('PLEASE ADD <script src="PAWStats.js"></script> TO YOUR CODE');
}
PAWStats.HttpCodeDesc = {
    "200": "OK",
    "201": "Created",
    "202": "Accepted",    "203": "Non-Authoritative Information",
    "204": "No Content",
    "205": "Reset Content",
    "206": "Partial Content",
    "207": "Multi-Status",
    "208": "Already Reported",
    "226": "IM Used",
    "300": "Multiple Choices",
    "301": "Moved Permanently",
    "302": "Found (Redirected/Other)",
    "303": "See Other",
    "304": "Not Modified",
    "305": "Use Proxy",
    "306": "Reserved",
    "307": "Temporary Redirect",
    "308": "Permanent Redirect",
    "400": "Bad Request",
    "401": "Unauthorized",
    "402": "Payment Required",
    "403": "Forbidden",
    "404": "Not Found (hits on favicon excluded)",
    "405": "Method Not Allowed",
    "406": "Not Acceptable",
    "407": "Proxy Authentication Required",
    "408": "Request Timeout",
    "409": "Conflict",
    "410": "Gone",
    "411": "Length Required",
    "412": "Precondition Failed",
    "413": "Request Entity Too Large",
    "414": "Request-URI Too Long",
    "415": "Unsupported Media Type",
    "416": "Requested Range Not Satisfiable",
    "417": "Expectation Failed",
    "422": "Unprocessable Entity",
    "423": "Locked",
    "424": "Failed Dependency",
    "426": "Upgrade Required",
    "427": "Unassigned",
    "428": "Precondition Required",
    "429": "Too Many Requests",
    "430": "Unassigned",
    "431": "Request Header Fields Too Large",
    "500": "Internal Server Error",
    "501": "Not Implemented",
    "502": "Bad Gateway",
    "503": "Service Unavailable",
    "504": "Gateway Timeout",
    "505": "HTTP Version Not Supported",
    "507": "Insufficient Storage",
    "508": "Loop Detected",
    "509": "Unassigned",
    "510": "Not Extended",
    "511": "Network Authentication Required",
};
/*
PAWStats.showHTTPErrorsAll = function () {
    myKeys = Object.keys(this.json);
    for (var i=0;i<myKeys.length;i++) {
        var site = myKeys[i];
        
        var t_chart = this.createHTTPErrorsChart(site, true);       
        document.body.appendChild(t_chart);
    }
}
*/
PAWStats.showHTTPErrorsSection = function (site, showTitle) {
    showTitle = (showTitle!==false); // default value is true
    if (showTitle) {
        document.writeln('<h2 Section>HTTP Status codes<btn onclick="PAWStats.collapseSection(this)">–</btn></h2>');
    }
    
    var section = document.createElement('Section-Frame');   
    var t_data = this.createHTTPErrorsData(site);
    section.appendChild(t_data.scroller);
    document.body.appendChild(section);
       
    sorttable.makeSortable(t_data.inline); // does not support colspan, so adjust for it.
    sorttable.innerSortFunction.apply(t_data.sortField, []);               
}

PAWStats.createHTTPErrorsData = function (site) {
    var sitedata=this.json[site][this.year+''+this.month];

    var INLINE_TABLE = document.createElement('table');
    var CAPTION = INLINE_TABLE.createCaption();
    var HEADER = INLINE_TABLE.createTHead();
    var BODY = INLINE_TABLE.createTBody();
    var FOOTER = INLINE_TABLE.createTFoot();
    var TR, TH, TD, TH_SORT;
    
    var idsJson=sitedata.ERRORS.ids;
    var defaultData = {hits:0, bandwidth:0};
        
    var SUM = this.cloneObject(defaultData);
    
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
    }
    
    INLINE_TABLE.className  = 't-sortstripe';
    
    TR = HEADER.insertRow(); TR.style.fontWeight='bold';
    
    TH = TR.insertCell(); TH.className = 'elliphdr lt itemtitle  sorttable_alpha';
    TH.innerHTML='Codes';
    TH = TH_SORT = TR.insertCell(); TH.className='hdr hits';
    TH.innerHTML='Hits';
    TH = TR.insertCell(); TH.className='hdr sorttable_numeric';
    TH.innerHTML='Percent';
    TH = TR.insertCell(); TH.className='hdr robohits sorttable_numeric';
    TH.innerHTML='Average<br>size';

    var idsJson=sitedata.ERRORS.ids;
    
    for (var dataID in idsJson) {
        var key=''+dataID;
        var data=idsJson[key];
        var FETCH;

        var ERRORS = data || {hits:0, bandwidth:0};
        TR = BODY.insertRow();

        TD = TR.insertCell(); TD.className = 'lt';
        var linkKeys={'404':true, '403':false, '400':false};
        var desc=this.HttpCodeDesc[key];
        desc = desc ? (key+' '+desc) : key;
        // workaround for iOS (doesn't support TD.style.display='block')
        // so... add a div wrapper.
        var txt='<div class="ellipsis">';
        if (linkKeys[key]) {
            var href=window.location.pathname+window.location.search+'&output=error'+key;
            txt+='<a title="Show '+key+'s" href="'+href+'">'+desc+'</a>';
        }
        else {
            txt+='<span title="'+desc+'">'+desc+'</span>';
        }
        txt+='</div>';
        TD.innerHTML=txt;

        TD = TR.insertCell(); TD.className = 'hdr';
        FETCH = ERRORS.hits * 1;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumHits+=FETCH;
        
        TD = TR.insertCell(); TD.className = 'hdr';
        FETCH = ERRORS.hits * 1 / SUM.hits *100;
        TD.innerHTML = FETCH._toLocalNo(1);
        TD.innerHTML+=' %';
        
        TD = TR.insertCell(); TD.className = 'hdr';
        FETCH = (ERRORS.bandwidth /1024/1024) / ERRORS.hits;
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
    TH.innerHTML='100.0 %';
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


