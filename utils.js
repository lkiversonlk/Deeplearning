/**
 * Created by liukan on 4/29/16.
 */
var mathjs = require("mathjs");

utils = {
    sigmoid : function (x) {
        return 1 / (1 + mathjs.pow(mathjs.e, -1 * x));
    },
    
    sigmoid_prime : function (x) {
        var m = utils.sigmoid(x);
        return m*(1-m);
    }
};

module.exports = utils;