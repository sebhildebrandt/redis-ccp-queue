'use strict';

const ccpq = require('../lib/index.js');

let c = new ccpq.Consumer('test', function (data, done) {
  handleMessage(data, done)
});

function handleMessage(data, done) {
  console.log('CONSUMER:');
  console.log(data);
  setTimeout(function () {
    done()
  }, 100 + Math.random() * 500);
}
setTimeout(function () {
  c.shutdown();
}, 20000);