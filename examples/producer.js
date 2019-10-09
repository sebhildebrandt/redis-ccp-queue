'use strict';

const ccpq = require('../lib/index.js');

const p = new ccpq.Producer('test');
for (let i = 1; i <= 50; i+=1) {
  p.push({ name: 'a', num: i });
}

p.size((size) => {
  console.log(size)
});

setTimeout(() => {
  p.shutdown();
}, 2000);