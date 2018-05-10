"use strict"

const isnumber = function(value) {
    return typeof value === 'number' && isFinite(value);
}

const isstring = function(value) {
    return typeof value === 'string' || value instanceof String;
}

const isArray = function(value) {
    return value && typeof value === 'object' && value.constructor === Array;
}

const isObject = function(value) {
    return value && typeof value === 'object' && value.constructor === Object;
}

const typeOfElements = function(list) {
    if (isArray(list)) { 
        const types = _.uniq(_.map(list, function(d){ 
            // typeof null === "object" 
            // typeof NaN === "number"
            if (typeof d === 'object') {
                if (d === null) { alert('null object found in the list of data. Check the input data!'); return "undefined"; }
                else { return d.constructor; }
            }
            else { 
                if (isNaN(d)) { alert('NaN object found in the list of data. Check the input data!'); return "undefined"; }
                else if ( isNaN(parseFloat(d)) ) { return typeof d; }
                else { return typeof parseFloat(d); } 
            }
        }));
    
        if (types.length === 1) { 
            const type = types[0];
            if (type === "number") { return "listOfNumbers"; }
            else if (type === "string") { return "listOfStrings"; }
            else if (type === Array) { return "listOfLists"; }
            else if (type === Object) { return "listOfObjects"; }
        }
    
        else { alert("The datatypes of elements are in the list are not consistent! Please check your data Dumbass :P"); }
    }
}

const dataTypeof = function(data) {
    
    if (isObject(data)) {
        const values = Object.values(data);
        const vType = typeOfElements(values);
        if ( vType === "listOfNumbers" ) { return "ObjectNumValues"; }
        else if ( vType === "listOfLists" ) { return "ObjectListValues"; }
        else if ( vType === "listOfObjects" ) { return "ObjectObjectValues"; }
        else if ( vType === "listOfStrings" ) { return "ObjectStringValues"; }
    }

    else if (isArray(data)) {
        return typeOfElements(data);
    }

}

export { dataTypeof }