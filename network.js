/**
 * Created by liukan on 4/29/16.
 */

var Rect = require("./rect");
var utils = require("./utils");

function Network(sizes) {
    var self = this;
    self.layers = [];
    self.layersCount = 0;
    self.biases = [];
    self.weights = [];

    if(Array.isArray(sizes)){
        sizes.forEach(function (x) {
            try{
                self.layers.push(parseInt(x));
            }catch (error){
                throw new TypeError("Network must be initialized with an array of numbers");
            }
        });
        self._init();

    }else{
        throw new TypeError("Network must be initialized with an array");
    }
}

/**
 * construct the network
 * @private
 */
Network.prototype._init = function () {
    var self = this;
    self.layersCount = self.layers.length;
    for(var i = 0; i < self.layersCount - 1; i++){
        self.biases.push((new Rect(self.layers[i + 1], 1)).randomize());
        self.weights.push(
            (new Rect(self.layers[i + 1], self.layers[i])).randomize()
        );
    }
};

/**
 * get the output of the network with specified input
 * @param input
 * @returns {*}
 */
Network.prototype.shake = function (input) {
    var self = this;
    var activation = null;

    if(Array.isArray(input) && input.length == self.layers[0]){
        activation = new Rect(input.length, 1, input);
    }else if(input instanceof Rect){
        activation = input;
    }else{
        throw new Error("input should be an array whose length equal to the count of network inputs");
    }

    for(var i = 0; i < self.layers.length -1 ; i ++){
        activation = self.weights[i].junc(activation).add(self.biases[i]).operate(utils.sigmoid);
    }

    return activation;
};

/**
 * backprop algorithm to calculate the diff
 * @param input
 * @param output
 */
Network.prototype.backprop = function (input, output) {
    var self = this;
    var zRect = [];

    var deltaW = [];
    var deltaB = [];
    var activation = [];

    if(Array.isArray(input) && input.length == self.layers[0]){
        zRect.push(new Rect(input.length, 1, input));
    }else if(input instanceof Rect && input.x == self.layers[0]){
        zRect.push(input);
    }else{
        throw new Error("input should be an array whose length equal to the count of network inputs");
    }

    for(var i = 0; i < self.layersCount -1 ; i++){
        var sigmoided = zRect[i].operate(utils.sigmoid);
        zRect.push(
            self.weights[i].junc(sigmoided).add(self.biases[i])
        );
        activation.push(sigmoided);
    }

    var deltaRect = zRect[zRect.length - 1].operate(utils.sigmoid).minus(output).operate(function (delta_z, i, j) {
        return delta_z * utils.sigmoid_prime(zRect[zRect.length - 1].get(i, j));
    });

    deltaB.unshift(deltaRect);
    deltaW.unshift(deltaRect.junc(activation[activation.length - 1].transpose()));

    for(var layer = self.layersCount - 3; layer >= 0; layer --){
        deltaRect = self.weights[layer].transpose().junc(deltaRect).operate(function (delta_z, i, j) {
            return delta_z * utils.sigmoid_prime(zRect[layer + 1].get(i, j));
        });
        deltaW.unshift(deltaRect);
        deltaB.unshift(deltaRect.junc(activation[layer-1].transpose()));
    }

    return [deltaW, deltaB];
};

/**
 *
 * @param data: data should be an array of [Rect, Rect]
 * @param rounds: how many rounds the updates will go
 * @param mini_batch_size
 * @param eta: the update step length
 * @param test: test dataset
 */
Network.prototype.SGD = function (data, rounds, mini_batch_size, eta, test) {

};

