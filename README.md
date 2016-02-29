# redis-ccp-queue

A simple and lightweight Competing Consumers Pattern Queue. Built with [node.js][nodejs-url] and [Redis][redis-url] (just about 100 lines of code). 

[![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![MIT license][license-img]][license-url]

Enable multiple concurrent consumers to process messages received on the same messaging channel.

## Quick Start

### Installation

```bash
$ npm install redis-ccp-queue --save
```

### Usage

#### Create a new Producer 

```javascript
'use strict';

const ccpq = require('redis-ccp-queue');

let p = new ccpq.Producer('QueueKey');    // create new producer instance 

...
p.push('message');                        // push a string message to queue
p.push({ name: 'object', num: 42 });      // push an object to queue
...
```

#### Create a new Consumer 

When creating a `consumer` you pass a callback function, that is called every time, when a new message is available from the queue:

```javascript
'use strict';

const ccpq = require('redis-ccp-queue');

let c = new ccpq.Consumer('QueueKey', function (data, done) {  // create new consumer instance 
  handleMessage(data, done)
});

// This is the function (callback) that actually handles the messages from the queue. 
// Put your worker-code inside this function. 
function handleMessage(data, done) {
  console.log('CONSUMER ' + id + ':');
  console.log(data);
  done();                                  // call done() when message is handled
}

// add the following lines to your consumer to safely disconnect from Redis
process
  .once('SIGINT', c.shutdown)
  .once('SIGTERM', c.shutdown);

```

Within your callback, you need to call the done() function, to let the `consumer` know, that the you are finished with the 
message handling. The name of this function can be changed. just choose your preferred name and pass it as a second parameter 
name to the callback function.  

#### Examples

I have attached a producer as well as a consumer in the `examples` folder.
To see the queue in acton, open three command line instances. Be sure to have redis installed and running. 

In the first command line window lauch the producer with

```
npm run producer
```

Then in the second command line window launch the first consumer with 

```
npm run consumer1
```

and immediately after then in the third command line window launch the second consumer with 

```
npm run consumer2
```

You should now see both consumers pulling from the queue. Each message is only handled by one of the consumers. 
I used some `setTimeout` functions to simulate longer message handling. I also added a timeout to disconnect the 
consumers from Redis after a certain period. 


## Core concept

The competing consumers pattern enables multiple consumers to pull and handle messages from the same queue, 
with the guarantee that each message is consumed once only. This pattern also allows multiple producers or 
senders to push messages to the same single queue. The queue is implemented as a FIFO (first in - first out queue): 

```
Application instances 									Consumer service instances pool
generating messages 												processing messages


--------------
| Producer 1 | --->
--------------

--------------															--------------
| Producer 2 | --->												--->	| Consumer 1 |
--------------															--------------

--------------			-------------------------------------			--------------
| Producer 3 | --->		| ------ ------	------       ------	|	--->	| Consumer 2 |
--------------			| | M5 | | M4 | | M3 | ....> | M1 |	|			--------------
						| ------ ------ ------       ------ |
	  .					-------------------------------------				  .
	  .							 Message Queue (FIFO)						  .
	  .																		  .

--------------															--------------
| Producer x | --->												--->	| Consumer n |
--------------															--------------

--------------
| Producer y | --->
--------------
```

Use this approach when:

- The workload for an application or task is divided into tasks that can run asynchronously.
- Tasks are independent and can run in parallel.
- You need a scalable solution, because the volume of work is highly variable.
- Your solution must provide high availability.


## Reference

#### Producer

| function        | Comments |
| -------------- | ------- |
| new ccpq.Producer(queueName [, options])  | expects an Queue-Name and (optional) Redis Options *)  |
| push(data) | push data to the queue. This can be either a string or an JSON object |
| shutdown() | disconnects safely from Redis |

#### Consumer

| function        | Comments |
| -------------- | ------- |
| new ccpq.Consumer(queueName, callback [, options]) | expects an Queue-Name, your callback function (where you handle/consume the data from the queue) and (optional) Redis Options *) |
| shutdown() | disconnects safely from Redis |

#### *) Connect to Redis 
When a new `Producer` or `Consumer` instance is created,
a connection to Redis will be created at the same time.
You can specify which Redis to connect to by:

```javascript
new Producer('QueueKey')                        // Connect to Redis Server at 127.0.0.1:6379
new Producer('QueueKey', 6380)                  // 127.0.0.1:6380
new Producer('QueueKey', '/tmp/redis.sock')
new Producer('QueueKey', {
  port: 6379,                                   // Redis port
  host: '127.0.0.1',                            // Redis host
  family: 4,                                    // 4 (IPv4) or 6 (IPv6)
  password: 'auth',
  db: 0
})
```

You can also specify connection options as a [`redis://` URL](http://www.iana.org/assignments/uri-schemes/prov/redis):

```javascript
// Connect to 127.0.0.1:6380, db 4, using password "authpassword":
new Redis('redis://:authpassword@127.0.0.1:6380/4')
```

See [ioredis API Documentation](https://github.com/luin/ioredis/blob/master/API.md#new_Redis) for all available options.

## Known Issues

This is the initial version of this package. At the moment, it really does, what I expected is to do. 
But I am sure, there is quite a lot of room for improvement. I am happy to discuss any comments and suggestions. 
Please feel free to contact me if you see any possibility of improvement!

## Version history

| Version        | Date           | Comment  |
| -------------- | -------------- | -------- |
| 1.0.0          | 2016-02-29     | initial release |

## Comments

If you have ideas or comments, please do not hesitate to contact me.

Happy queueing!

Sincerely,

Sebastian Hildebrandt, [+innovations](http://www.plus-innovations.com)

## Credits

Written by Sebastian Hildebrandt [sebhildebrandt](https://github.com/sebhildebrandt)

## Trademarks
 
Node.js is a trademark of Joyent Inc., Redis, and the Redis logo are the trademarks of 
Salvatore Sanfilippo in the U.S. and other countries. Linux is a registered trademark of 
Linus Torvalds. All other trademarks are the property of their respective owners.

## License [![MIT license][license-img]][license-url]

>The [`MIT`][license-url] License (MIT)
>
>Copyright &copy; 2016 Sebastian Hildebrandt, [+innovations](http://www.plus-innovations.com).
>
>Permission is hereby granted, free of charge, to any person obtaining a copy
>of this software and associated documentation files (the "Software"), to deal
>in the Software without restriction, including without limitation the rights
>to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
>copies of the Software, and to permit persons to whom the Software is
>furnished to do so, subject to the following conditions:
>
>The above copyright notice and this permission notice shall be included in
>all copies or substantial portions of the Software.
>
>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
>IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
>FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
>AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
>LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
>OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
>THE SOFTWARE.
> 
>Further details see [LICENSE](LICENSE) file.


[npm-image]: https://img.shields.io/npm/v/redis-ccp-queue.svg?style=flat-square
[npm-url]: https://npmjs.org/package/redis-ccp-queue
[downloads-image]: https://img.shields.io/npm/dm/redis-ccp-queue.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/redis-ccp-queue

[license-url]: https://github.com/sebhildebrandt/redis-ccp-queue/blob/master/LICENSE
[license-img]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[npmjs-license]: https://img.shields.io/npm/l/redis-ccp-queue.svg?style=flat-square

[nodejs-url]: https://nodejs.org/
[redis-url]: http://redis.io
