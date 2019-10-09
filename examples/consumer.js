'use strict';

const ccpq = require('../lib/index.js');

const handleMessage = (data, done) => {
  console.log('CONSUMER:');
  console.log(data);
  setTimeout(() => {
    done()
  }, 100 + Math.random() * 500);
}

const c = new ccpq.Consumer('test', (data, done) => {
  handleMessage(data, done)
});

setTimeout(() => {
  c.shutdown();
}, 20000);