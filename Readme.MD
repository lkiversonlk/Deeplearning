神经网络和深度学习 Nodejs
######

附注:
该程序基于[链接](http://neuralnetworksanddeeplearning.com/)介绍的思路所写.
--------

# 数据集
使用的[MNIST](http://neuralnetworksanddeeplearning.com/)数据集提供的训练数据(60000张图片)以及测试数据(10000张图片). 数据已经附在git库中.

# 程序对象

* rect
矩阵类,提供了基本的运算支持.

* network
神经网络类,初始化时指定网络层数(包括输入和输出层), 使用SGD方法进行训练

* MNIST
用以从MNIST的文件中load数据

* main
主方法,运行图片识别训练程序

# 运行方法

安装:
npm install

运行mian:

node main.js