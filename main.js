/**
 * Created by liukan on 4/29/16.
 */

var MNIST = require("./MNIST");
var path = require("path");
var Network = require("./network");

function main() {
    var mninst = new MNIST(path.join(__dirname, "data"));

    var imagesResult = mninst.loadImage("train-images-idx3-ubyte");

    var imageDataChannelCount = imagesResult[0];
    var imagesData = imagesResult[1];

    var labels = mninst.loadLabels("train-labels-idx1-ubyte");

    var testImagesResult = mninst.loadImage("t10k-images-idx3-ubyte");
    var testLabels = mninst.loadLabels("t10k-labels-idx1-ubyte");
    var testImagesData = testImagesResult[1];

    var network = new Network([imageDataChannelCount, 30, 10]);

    network.SGD(imagesData.slice(0, 1000), labels.slice(0, 1000), 30, 40, 3.0, testImagesData.slice(0, 1000), testLabels.slice(0, 1000));
};

main();