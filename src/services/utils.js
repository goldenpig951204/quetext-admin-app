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

const extractCookies = (cookies) => {
    let allCookies = '';
    let counter = 1;

    if (typeof cookies !== 'object'){
        return '';
    }

    const length = cookies.length;
    for (let i = 0; i < length; i++) {
        let currentCookie = cookies[i];
        currentCookie = currentCookie.replace(/;\s.+/i, "");
        if (i === length - 1) {
            allCookies += currentCookie + ";";
        } else {
            allCookies += currentCookie + "; ";
        }
        counter++;
    }

    return allCookies;
};
module.exports = {
    JSON_to_URLEncoded,
    extractCookies
}