"use strict";

const client = require("..");
const options = {
  application: "demo",
  interval: 10000 // 10 seconds
};

const obs = client.observe(options);

obs.create('my.property')
  .subscribe(
    value => console.log(`The value now is ${value}`),
    error => console.error(error),
    () => console.log('Finished')
  );

// each 10 seconds the client will check the config server again.
// if the value is changed, the `subscribe` method will be called with the new value.

// you can also close the observable:
// obs.close();
// this will prevent new querying and will emit "complete" for all subscribes