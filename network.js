/**
 * Created by liukan on 4/29/16.
 */

var Rect = require("./rect");
var utils = require("./utils");

/**
 * Init the Network with a size array,
 * Network([2, 4, 5]) initial a network which has 2 input nodes, 1 hidden layer with 4 nodes, 1 ouput layer with 5 nodes
 * the weights and biases will be random value in [0, 1)
 *
 * weights[i] is an rect of width * height, width is the count of nodes in layer i + 1, height is the count of nodes in layer i
 * biases[i] is an rect of width * 1, width is the count of nodes in layer i + 1.
 *
 * so given the value in layer[i]: data
 * the layer[i + 1] should be : weights[i] * data + biase[i]
 * @param sizes
 * @constructor
 */
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
    //
    // zRect store [input, (wx + b)]
    // sigmoided store [input, sigmoided]

    var self = this;
    var zRect = [];

    var deltaW = [];
    var deltaB = [];
    var activation = [];

    if(Array.isArray(input) && input.length == self.layers[0]){
        zRect.push(new Rect(input.length, 1, input));
        activation.push(input);
    }else if(input instanceof Rect && input.x == self.layers[0]){
        zRect.push(input);
        activation.push(input);
    }else{
        throw new Error("input should be an array whose length equal to the count of network inputs");
    }

    var sigmoided = zRect[0];

    for(var i = 0; i < self.layersCount -1 ; i++){
        zRect.push(
            self.weights[i].junc(sigmoided).add(self.biases[i])
        );
        sigmoided = zRect[i + 1].copy().operate(utils.sigmoid);
        activation.push(sigmoided);
    }

    // Wi * ai + Bi = ai+1
    // Delta(zi) = (ai - yi) * sigmoid_prime(zi)

    var deltaRect = activation[activation.length - 1].copy()
        .operate(function (delta, i, j) {
            if(i == output){
                return delta - 1;
            }else{
                return delta;
            }
        })
        .operate(function (delta_z, i, j) {
            return delta_z * utils.sigmoid_prime(zRect[zRect.length - 1].get(i, j));
        });

    deltaB.unshift(deltaRect);
    deltaW.unshift(deltaRect.junc(activation[activation.length - 2].transpose()));

    // we have Delta(zi), in this case, is Delta(z2)
    // so first we need to use w1[T] * Delta(z2) * sigmoid_prime(z1) to get Delta(z1)
    // then Delta(b0) is the same with the Delta(z1)
    //      Delta(w0) is Delta(z1) * A0 which is the input array
    for(var layer = self.layersCount - 3; layer >= 0; layer --){
        deltaRect = self.weights[layer + 1].transpose().junc(deltaRect).operate(function (delta_z, i, j) {
            return delta_z * utils.sigmoid_prime(zRect[layer + 1].get(i, j));
        });
        deltaB.unshift(deltaRect);
        deltaW.unshift(deltaRect.junc(activation[layer].transpose()));
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
Network.prototype.SGD = function (images, labels, rounds, mini_batch_size, eta, testImages, testLabels) {
    var self = this;
    if(images.length != labels.length){
        throw new Error("the length of image should be equal to the length of the label");
    }

    for(var round = 0; round < rounds; round ++){
        var batch_count = parseInt(images.length / mini_batch_size);
        var seq = utils.shuffle(images.length);

        for(var i = 0; i < batch_count; i ++){
            //console.log("processing mini batch from " + i * batch_count + " to " + ((i + 1) * batch_count - 1));
            self.update_mini_batch(
                images,
                labels,
                seq.slice(i * mini_batch_size, (i + 1) * mini_batch_size),
                eta
            );
        }

        if(testImages && testLabels){
            var correct = self.evaluate(testImages, testLabels);
            console.log("the correct result count is now: " + correct);
        }
    }
};

Network.prototype.evaluate = function (input, output) {
    var self = this;
    var correct = 0;

    if(input.length == output.length){
        for(var i = 0; i < input.length; i++){
            var cal = self.shake(input[i]);

            var max = null, result = null;
            for(var j = 0; j < cal.x; j ++){
                if(max == null || cal.get(j, 0) > max){
                    result = j;
                    max = cal.get(j, 0);
                }
            }
            if(max != null && result == output[i]){
                correct ++;
            }
        }
        return correct;
    }else{
        throw new Error("evaluate must use input and output of the same length");
    }
};

Network.prototype.update_mini_batch = function (images, labels, seq, eta) {
    var self = this;

    if(images.length != labels.length){
        throw new Error("images' length should be equal to labels");
    }

    var nabla_w = self.weights.map(function (weight) {
        return new Rect(weight.x, weight.y).reset(0);
    });
    var nabla_b = self.biases.map(function (biase) {
        return new Rect(biase.x, biase.y).reset(0);
    });

    for(var i = 0; i < seq.length; i ++){
        var index = seq[i];
        var ret = self.backprop(images[index], labels[index]);
        var delta_w = ret[0];
        var delta_b = ret[1];

        if(delta_b.length != delta_w.length || delta_b.length != nabla_w.length){
            throw new Error("backprop return array with length error");
        }

        nabla_w.forEach(function (sub_nabla_w, i) {
            sub_nabla_w.operate(function (data, x, y) {
                return data + delta_w[i].get(x, y);
            });
        });

        nabla_b.forEach(function (sub_nabla_b, i) {
            sub_nabla_b.operate(function (data, x, y) {
                return data + delta_b[i].get(x, y);
            });
        });
    }

    for(var i = 0; i < self.weights.length; i ++){
        self.weights[i].operate(function (data, x, y) {
            return data - eta / seq.length * nabla_w[i].get(x, y);
        });
    }

    for(var i = 0; i < self.biases.length; i ++){
        self.biases[i].operate(function (data, x, y) {
            return data - eta / seq.length * nabla_b[i].get(x, y);
        });
    }
};

module.exports = Network;