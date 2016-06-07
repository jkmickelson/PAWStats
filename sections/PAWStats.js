var PAWStats = PAWStats || {};
PAWStats.loaded = true; // Only set in this file (PAWStats.js)

PAWStats.json = PAWStats.json || [];

PAWStats.fractionDigits=2;
PAWStats.precision=Math.pow(10, PAWStats.fractionDigits);

PAWStats.debug = function (text) {
    document.writeln('<p>'+text+'</p>');
};

PAWStats.collapseSection = function (elem) {
    var target=elem.parentElement.nextSibling.nextSibling;
    target.style.display = 
        (target.style.display=='none') ? 'block' : 'none';
    elem.innerHTML = 
        target.style.display=='none' ? '+' : '–';
}
PAWStats.cloneObject = function (obj) {
    return (JSON.parse(JSON.stringify(obj)));
}

// PRIVATE PROTOTYPES
Number.prototype._toLocalNo = function (digits) {
    digits = digits || 0;
    var precision = Math.pow(10, digits);
    var value = Math.round(this * precision) / precision;
    return value.toLocaleString(undefined,{
        minimumFractionDigits : digits,
        maximumFractionDigits : digits
    });
};
String.prototype._toLocalNo = function (digits) {
    digits = digits || 0;
    return (this*1)._toLocalNo(digits);
};
