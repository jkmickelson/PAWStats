var PAWStats = PAWStats || {};
PAWStats.json = PAWStats.json || [];

PAWStats.showSites = function () {
    var SumUniq=0, SumVisits=0, SumPages=0, SumHits=0, SumBandwidth=0;
    var TR, TH, TD, TH_SORT;
    var eTable = document.createElement('table');
    eTable.className  = 't-sortstripe';

    TR = eTable.insertRow(); TR.style.fontWeight='bold';

    TH = TR.insertCell();
    TH.innerHTML='Statistics for'; TH.style.backgroundColor = '#ECECEC'; TH.className = 'hdr lt sorttable_alpha';
    TH = TH_SORT = TR.insertCell(); TH.className='hdr uniq';
    TH.innerHTML='Unique<br>visitors';
    TH = TR.insertCell(); TH.className='hdr visits';
    TH.innerHTML='Number<br>of visits';
    TH = TR.insertCell(); TH.className='hdr pages';
    TH.innerHTML='Pages';
    TH = TR.insertCell(); TH.className='hdr hits';
    TH.innerHTML='Hits';
    TH = TR.insertCell(); TH.className='hdr bandwidth sorttable_numeric';
    TH.innerHTML='Bandwidth';

    myKeys = Object.keys(this.json);
    for (var i=0;i<myKeys.length;i++) {
        var site = myKeys[i];
        var dateKey = this.year+''+this.month;
        var data = this.json[site][dateKey] || {
            GENERAL:{TotalUnique:{count:0},TotalVisits:{count:0}},
            TIME:{totals:{pages:0,hits:0,bandwidth:0,notviewed:{pages:0,hits:0,bandwidth:0}}}
            };
        var FETCH;

        TR = eTable.insertRow();

        TD = TR.insertCell(); TD.className = 'lt';
        var loc = location.pathname;       
        loc+='?site='+site+'&year='+PAWStats.year+'&month='+PAWStats.month;
        TD.innerHTML = '<a href="'+loc+'">'+site+'</a>';
        TD = TR.insertCell(); 
        FETCH = (data.GENERAL.TotalUnique.count * 1);
        TD.innerHTML = parseInt( FETCH ).toLocaleString();
        SumUniq+=FETCH;

        TD = TR.insertCell(); 
        FETCH = (data.GENERAL.TotalVisits.count * 1);
        TD.innerHTML = parseInt( FETCH ).toLocaleString();
        SumVisits+=FETCH;

        TD = TR.insertCell(); 
        FETCH = data.TIME.totals.pages + data.TIME.totals.notviewed.pages;
        TD.innerHTML = parseInt( FETCH ).toLocaleString();
        SumPages+=FETCH;

        TD = TR.insertCell(); 
        FETCH = data.TIME.totals.hits + data.TIME.totals.notviewed.hits;
        TD.innerHTML = parseInt( FETCH ).toLocaleString();
        SumHits+=FETCH

        TD = TR.insertCell(); 
        FETCH = (Math.round(
            ( (data.TIME.totals.bandwidth + data.TIME.totals.notviewed.bandwidth) /1024/1024)
            * 100) / 100);
        TD.innerHTML=(FETCH * 1).toLocaleString(undefined,{
            minimumFractionDigits : 2,
            maximumFractionDigits : 2
        });
        TD.innerHTML+=' MB';
        SumBandwidth+=FETCH

    }

    var footer = eTable.createTFoot();
    TR = footer.insertRow();
    TR.style.backgroundColor = '#F0F0F0';

    TH = TR.insertCell();
    TH.innerHTML='Total'; TH.className = 'lt';
    TH = TR.insertCell();
    TH.innerHTML=parseInt( SumUniq ).toLocaleString();
    TH = TR.insertCell();
    TH.innerHTML=parseInt( SumVisits ).toLocaleString();
    TH = TR.insertCell();
    TH.innerHTML=parseInt( SumPages ).toLocaleString();
    TH = TR.insertCell();
    TH.innerHTML=parseInt( SumHits ).toLocaleString();
    TH = TR.insertCell();
    TH.innerHTML=(SumBandwidth * 1).toLocaleString(undefined,{
        minimumFractionDigits : 2,
        maximumFractionDigits : 2
    });
    TH.innerHTML+=' MB';

    document.body.appendChild(eTable);
    
    sorttable.makeSortable(eTable);
    sorttable.innerSortFunction.apply(TH_SORT, []);        
}


