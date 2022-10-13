const JSON_to_URLEncoded = (element,key,list) => {
    var list = list || [];
    if(typeof(element)=='object'){
        for (var idx in element)
        JSON_to_URLEncoded(element[idx],key?key+'['+idx+']':idx,list);
    } else {
        list.push(key+'='+encodeURIComponent(element));
    }
    return list.join('&');
}

module.exports = {
    JSON_to_URLEncoded
}