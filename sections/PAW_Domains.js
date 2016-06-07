var PAWStats = PAWStats || {};
if (!PAWStats.loaded) {
    alert('PLEASE ADD <script src="PAWStats.js"></script> TO YOUR CODE');
}

PAWStats.showDomainsAll = function () {
    myKeys = Object.keys(this.json);
    for (var i=0;i<myKeys.length;i++) {
        var site = myKeys[i];
        
        var t_chart = this.createDomainsMap(site, true);       
        document.body.appendChild(t_chart);
    }
}

PAWStats.showDomainsSection = function (site, showTitle) {
    showTitle = (showTitle!==false); // default value is true
    if (showTitle) {
        document.writeln('<h2 Section>Visitors domains/countries<btn onclick="PAWStats.collapseSection(this)">–</btn></h2>');
    }
    
    var section = document.createElement('Section-Frame');
    var t_chart = this.createDomainsMap(site);
    section.appendChild(t_chart);
    section.appendChild(document.createElement('br'));
    
    var t_data = this.createDomainsData(site);
    section.appendChild(t_data);
    document.body.appendChild(section);
       
    sorttable.makeSortable(t_data); // does not support colspan, so adjust for it.
    //sorttable.innerSortFunction.apply(TH_SORT, []);               
}

PAWStats.createDomainsMap = function (site, showCaption) {
    var sitedata=this.json[site][this.year+''+this.month];
    var SumPages=0, SumHits=0, SumBandwidth=0;
    
    var MAP_HOLDER = document.createElement('div');
    MAP_HOLDER.className="chart-map";
    var mapName = 'map-'+site+'-'+this.year+this.month;

    if (showCaption) {
        //CAPTION.innerHTML = '<a href="#">'+site+'</a>';
    }

    var idsJson=sitedata.DOMAIN.ids;
    
    MAP_HOLDER.innerHTML = '<object id="'+mapName+'" name="'+mapName+'"'
        +' type="image/svg+xml"'
        +' data="sections/PAW_WorldMap.svg"'
        +' width="100%"></object>';
    
    var self=this;
    window.addEventListener("load", function(){
        self.applyMapData(mapName, idsJson);
    });
          
    return MAP_HOLDER;
}

PAWStats.applyMapData = function (mapName, mapData) {
    var elem = document.getElementById(mapName);
    var MAP = (elem && elem.contentDocument);
    var MaxValue = 0.001;
    
    if (!MAP) {
        return;
    }
    
    // debug: add additional test data
    //mapData['ar']={pages:40};
    //mapData['nz']={pages:40};
    //mapData['au']={pages:40};
    //mapData['za']={pages:40};
    //mapData['us']={pages:40};
    //mapData['ru']={pages:40};
    //mapData['fr']={pages:40};
    //mapData['com']={pages:0};

    function _setColorAndHoverClass(cntryElem, color) {
        // color <g>roup or <path> AND set a hover class
        if (cntryElem && cntryElem.tagName == 'g') {
            cntryElem.className.baseVal+=' landhover';
            [].forEach.call(cntryElem.children, function(child) {
                if (child.tagName == 'g') {
                    child.className.baseVal+=' landhover';
                    [].forEach.call(child.children, function(subchild) {
                        subchild.style.fill = color;
                    });    
                }
                else if (child.tagName !== 'text') {
                    child.style.fill = color;
                }
            });    
        }
        else if (cntryElem.tagName == 'path' || cntryElem.tagName == 'rect') {
            cntryElem.className.baseVal+=' landhover';
            cntryElem.style.fill = color;
        }
        else {
            cntryElem.style.fill = 'red';
        }
    }

    function _calcColor(value, maxValue) {
        var colorNo = 150 - Math.floor(value * 150 / maxValue);
        var gcolorNo = 100 + Math.floor(value * 255 / maxValue);
        var transparency = Math.max(Math.min( (gcolorNo-80)/80, 1.0), 0.1);
    
        var color = "rgba(" + Math.round(colorNo/1.0) + ","
                            + (255-colorNo) + ","
                            + Math.round(colorNo/2.0) + ","
                            + transparency + ")";
        return color;
    }

    // Get Max Value
    for (var domainID in mapData) {
        if (mapData[domainID].pages*1 > MaxValue) {
            MaxValue = mapData[domainID].pages*1;
        }
    }

    if (!this.mapTitleTemplate) {
        this.mapTitleTemplate = MAP.getElementById('titleTemplate');
    }

    // Set Color Legend
    for (var i=0; i<=100; i+=20) {
        var legendValue = i || 1; // use 1 for minimum legend value
        var cssColor = _calcColor(legendValue, 100);
        var legendElem = MAP.getElementById('pct'+legendValue);
        _setColorAndHoverClass(legendElem, cssColor);
    }

    // Convert Map Data into Color with Hover Tooltip behavior
    for (var domainID in mapData) {
        var value = mapData[domainID].pages;
        cssColor = _calcColor(value, MaxValue);
        var cntryElem = MAP.getElementById(domainID);
        if (cntryElem) {
            _setColorAndHoverClass(cntryElem, cssColor);
            cntryElem.onmousemove=this.mapTitleTemplate.onmousemove;
            cntryElem.onmouseout=this.mapTitleTemplate.onmouseout;
            var domainText = this.CountryDomains[domainID] || domainID
            cntryElem.setAttribute('TitleTip', domainText+': '+value);
        }
        var cntryElem = MAP.getElementById(domainID+'_text');
        if (cntryElem) {
            cntryElem.onmousemove=this.mapTitleTemplate.onmousemove;
            cntryElem.onmouseout=this.mapTitleTemplate.onmouseout;
            var domainText = this.CountryDomains[domainID] || domainID
            cntryElem.setAttribute('TitleTip', domainText+': '+value);        
        }
    }    
}

PAWStats.createDomainsData = function (site) {
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
    TH.innerHTML='Domain/Countries';
    TH = TR.insertCell(); TH.className = 'lt itemtitle  sorttable_alpha';
    TH.innerHTML=''; // Flags
    TH = TR.insertCell(); TH.className = 'lt itemtitle  sorttable_alpha';
    TH.innerHTML=''; // Codes
    TH = TH_SORT = TR.insertCell(); TH.className='hdr pages';
    TH.innerHTML='Pages';
    TH = TR.insertCell(); TH.className='hdr hits';
    TH.innerHTML='Hits';
    TH = TR.insertCell(); TH.className='hdr bandwidth sorttable_numeric';
    TH.innerHTML='Bandwidth';
    
    var idsJson=sitedata.DOMAIN.ids;
    
    for (var domainID in idsJson) {
        var key=''+domainID;
        var data=idsJson[key];
        var FETCH;

        var DOMAIN = data || {pages:0, hits:0, bandwidth:0};
        
        TR = BODY.insertRow();

        TD = TR.insertCell(); TD.className = 'lt';
        TD.innerHTML=this.CountryDomains[key];
        TD = TR.insertCell(); TD.className = 'lt';
        TD.innerHTML='<img src="icons/flags/'+key+'.png">';
        TD = TR.insertCell(); TD.className = 'lt';
        TD.innerHTML=key;

        TD = TR.insertCell(); 
        FETCH = DOMAIN.pages * 1;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumPages+=FETCH;

        TD = TR.insertCell(); 
        FETCH = DOMAIN.hits * 1;
        TD.innerHTML = FETCH._toLocalNo();
        this.SumHits+=FETCH;

        TD = TR.insertCell(); 
        FETCH = (DOMAIN.bandwidth /1024/1024) ;
        TD.innerHTML = FETCH._toLocalNo(2);
        TD.innerHTML+=' MB';
        this.SumBandwidth+=FETCH;

    }
        
    TR = FOOTER.insertRow();
    TR.style.backgroundColor = '#E0E0E0';

    TH = TR.insertCell();
    TH.innerHTML='Total';
    TH.colSpan=3;
    TH = TR.insertCell();
    TH.innerHTML=this.SumPages._toLocalNo();
    TH = TR.insertCell();
    TH.innerHTML=this.SumHits._toLocalNo();
    TH = TR.insertCell();
    TH.innerHTML=this.SumBandwidth._toLocalNo(2);
    TH.innerHTML+=' MB';
            
    return INLINE_TABLE;
}


