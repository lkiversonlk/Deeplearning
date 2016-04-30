/**
 * Created by liukan on 4/29/16.
 */


var Rect = require("./rect");
var utils = require("./utils");

var rect = new Rect(4, 5);
rect.randomize();


var rectA = new Rect(2, 2, [0, 1, 0, 1]);
var rectB = new Rect(2, 1, [1, 0]);

var rectC = rectA.junc(rectB);
console.log(rectC.toString());

console.log(rectC.transpose().toString());

console.log(utils.sigmoid(1));

console.log(utils.shuffle(4));