'use strict';

const Redis = require('ioredis');
const debug = require('debug')('redis-ccp-queue');

// -----------------------------------
// Generic FIFO Queue Class
// -----------------------------------

class Queue {
  constructor (queueName, redisOptions) {
    redisOptions = redisOptions || {};
    this.redis = new Redis(redisOptions);
    this.queueName = queueName;
    this.queueKey = 'queues:' + queueName;
    this.timeout = 0;   // zero means no timeout
    this.shuttingDown = false;
  }

  size (callback) {
    this.redis.llen(this.queueKey, (err, size) => {
      callback(size);
    });
  };

  push (data) {
    if (typeof data === 'object') {
      data = JSON.stringify(data)
    }
    this.redis.lpush(this.queueKey, data);
  };

  pop (callback) {
    this.redis.brpop(this.queueKey, this.timeout, (err, replies) => {
      if (err) {
        callback(null);
      } else {
        let data = replies[1] || '';
        if (data && typeof data === 'string' && data.length > 1 && data[0] == '{' && data[data.length - 1] == '}') {
          data = JSON.parse(data);
        }
        callback(data);
      }
    });
  };

  purge (callback) {
    this.redis.del(this.queueKey, (err, reply) => {
      if (callback && typeof callback === "function") {
        callback();
      }
    })
  }

  shutdown () {
    this.shuttingDown = true;
    debug('shutting down');
    try {
      this.redis.disconnect();
    } catch (err) {

    }

  }
}

// -----------------------------------
// Producer Class
// -----------------------------------

class Producer {
  constructor (queueName, redisOptions) {
    redisOptions = redisOptions || {};
    this.queueName = queueName;
    this.queue = new Queue(queueName, redisOptions);
    this.shuttingDown = false;
  }

  push (data) {
    this.queue.push(data);
  }

  size (callback) {
    this.queue.size(function(size) {
      callback(size);
    })
  };

  shutdown () {
    this.queue.shutdown();
  }
}

// -----------------------------------
// Consumer Class
// -----------------------------------

class Consumer {
  constructor (queueName, callback, redisOptions) {
    redisOptions = redisOptions || {};
    this.queueName = queueName;
    this.queue = new Queue(queueName, redisOptions);
    this.shuttingDown = false;
    this.callback = callback;

    let self = this;
    process
      .once('SIGINT', function () {
        self.queue.shutdown()
      })
      .once('SIGTERM', function () {
        self.queue.shutdown()
      });

    this.waitForNext(this);
  }

  waitForNext (self) {
    self.queue.pop((data) => {
      if (!self.queue.shuttingDown) {
        if (data === null) {
          self.done();
        } else {
          self.callback(data, function() {
            self.done();
          })
        }
      } else {
        debug('exit');
        process.exit(1);
      }
    });
  }

  done () {
    process.nextTick(() => {this.waitForNext(this)});
  }

  shutdown () {
    this.queue.shutdown();
  }
}

module.exports = {
  Producer: Producer,
  Consumer: Consumer
};
