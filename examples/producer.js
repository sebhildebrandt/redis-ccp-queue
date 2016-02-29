'use strict';

const ccpq = require('../lib/index.js');

let p = new ccpq.Producer('test');
for (var i = 1; i <= 50; i++) {
  p.push({ name: 'a', num: i });
}

p.size(function (size) {
  console.log(size)
});

setTimeout(function () {
  p.shutdown();
}, 2000);