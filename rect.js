/**
 * Created by liukan on 4/29/16.
 */

var utils = require("./utils");

function Rect(x, y, data) {
    var self = this;
    this.x = parseInt(x);
    this.y = parseInt(y);

    if(data){
        this.data = data;
    }else{
        this.data = [];
    }

    if(this.x <= 0 || this.y <= 0){
        throw new TypeError("can't initial rect with dimensions less than 0");
    }
};

/**
 * init the rect elements to be random value in (0, 1)
 * @returns {Rect}
 */
Rect.prototype.randomize = function () {
    var self = this;
    for(var i = 0 ; i < self.y; i ++){
        for(var j = 0; j < self.x; j ++){
            self.data[i * self.x + j]= Math.random() - 0.5;
        }
    }
    return self;
};

/**
 * return a new rect that the represent the junc result
 * @param rect
 * @returns {Rect}
 */
Rect.prototype.junc = function (rect) {
    var self = this;
    if(rect instanceof Rect){
        if(self.y != rect.x){
            throw new Error("left rect's height should equal right rect's width");
        }else{
            var ret = new Rect(self.x, rect.y);
            for(var h = 0; h < rect.y; h ++){
                for(var w = 0; w < self.x; w ++){
                    var sum = 0;
                    for(var i = 0; i < self.y; i++){
                        sum += self.get(w, i) * rect.get(i, h);
                    }
                    ret.set(w, h, sum);
                }
            }
            return ret;
        }
    }else{
        throw new TypeError("Rect could only junc rect");
    }
};

Rect.prototype.toString = function () {
    var self = this;
    var ret = "";
    for(var i = 0; i < self.y ; i ++){
        var sub = "";
        for(var j = 0; j < self.x; j ++){
            sub += (self.get(j, i) + ",");
        }
        ret += sub;
        ret += "\n";
    }
    return ret;
};

Rect.prototype.get = function (x, y) {
    if(x < 0 || x >= this.x || y < 0 || y >= this.y){
        throw new Error("out of bounds:" + x + "," + y);
    }else {
        return this.data[y * this.x + x];
    }
};

Rect.prototype.set = function (x, y, data) {
    if(x < 0 || x >= this.x || y < 0 || y >= this.y){
        throw new Error("out of bounds:" + x + "," + y);
    }else {
        this.data[y * this.x + x] = data;
    }
};

/**
 * return a new rect that is the transpose of the original rect
 * @returns {Rect}
 */
Rect.prototype.transpose = function () {
    var self = this;
    var ret = new Rect(self.y, self.x);

    for(var i = 0; i < self.x; i ++){
        for(var j = 0; j < self.y; j++){
            ret.set(j, i, self.get(i, j));
        }
    }
    return ret;
};

/**
 * operate on the original rect, update its data
 * @param operate
 * @returns {Rect}
 */
Rect.prototype.operate = function (oper) {
    var self = this;
    for(var i = 0; i < self.x; i ++){
        for(var j = 0; j < self.y; j++){
            self.set(i, j, oper(self.get(i, j), i, j));
        }
    }
    return self;
};

/**
 * oprate on the original rect with the added data
 * @param rect
 * @returns {Rect}
 */
Rect.prototype.add = function (rect) {
    var self = this;
    if(rect instanceof Rect && this.x == rect.x && this.y == rect.y){
        return self.operate(function (data, i, j) {
            return data + rect.get(i, j);
        });
    }else{
        throw new Error("only rect with the same width and height could add together");
    }
};

Rect.prototype.minus = function (rect) {
    var self = this;
    return self.add(rect.operate(function (data) {
        return -1 * data;
    }));
};

Rect.prototype.size = function () {
    return this.x * this.y;
};

Rect.prototype.reset = function (x) {
    return this.operate(function (data, i, j) {
        return x;
    });
};

/**
 * return new copy of the rect which has the same data with the original
 * @returns {Rect}
 */
Rect.prototype.copy = function () {
    var self = this;
    var ret = new Rect(self.x, self.y);
    return ret.operate(function (data, i, j) {
        return self.get(i, j);
    });
};

module.exports = Rect;