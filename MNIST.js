/**
 * Created by liukan on 4/29/16.
 */
var path = require("path");
var fs = require("fs");
var Rect = require("./rect");

function MNIST(baseFolder) {
    var self = this;
    self.folder = baseFolder;
}

MNIST.prototype.loadImage = function (imageFileName) {
    var self = this;
    var buffer = fs.readFileSync(path.join(self.folder, imageFileName));

    var magicNumber = buffer.readInt32BE(0);
    var imageCount = buffer.readInt32BE(4);

    var rows = buffer.readInt32BE(8);
    var cols = buffer.readInt32BE(12);

    console.log("parsing image file: image count " + imageCount + ", row: " + rows + ", columns: " + cols);
    var start = 16;
    var images = [imageCount];
    var datalen = rows * cols;

    for(var i = 0; i < imageCount; i ++){
        var data = new Rect(datalen, 1);
        for(var c = 0; c < cols; c ++){
            for(var r = 0; r < rows; r ++){
                var offset = c * rows + r;
                data.set(offset, 0, buffer.readUInt8(start + offset) / 255);
            }
        }
        start += datalen;
        images[i] = data;
    }

    return [datalen, images];
};

MNIST.prototype.loadLabels = function (labelFileName) {
    var self = this;
    var buffer = fs.readFileSync(path.join(self.folder, labelFileName));

    var magicNumber = buffer.readInt32BE(0);
    var labelCount = buffer.readInt32BE(4);

    var start = 8;
    var ret = [labelCount];

    console.log("parsing label file: label count: " + labelCount);
    for(var i = 0; i < labelCount; i ++){
        ret[i] = buffer.readUInt8(start + i);
    }

    return ret;
};

module.exports = MNIST;