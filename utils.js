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
    },

    //return a random arranged array contains data from 0 to index - 1
    shuffle : function (index) {
        var data = [index];
        for(var i = 0; i < index ; i ++){
            data[i] = i;
        }

        function swap(i, j) {
            var temp = data[j];
            data[j] = data[i];
            data[i] = temp;
        }

        for(var i = 0; i < index; i++){
            var select = parseInt(Math.random() * (index - i));
            swap(i, select + i);
        }
        return data;
    }
};

module.exports = utils;