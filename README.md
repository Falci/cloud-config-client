Spring Cloud Config Client for NodeJS
=====================================

[![Build Status](https://travis-ci.org/Falci/cloud-config-client.svg?branch=master)](https://travis-ci.org/Falci/cloud-config-client)

Requires: NodeJS 4+

Feature requests are welcome.

This proejct is based on [Víctor Herraiz Posada](https://github.com/victorherraiz)'s [cloud-config-client](https://github.com/victorherraiz/cloud-config-client) version 0.3.1.
All original features are compatible, plus the `observe` method that retuns a observable factory for properties.


Install
-------

    npm install cloud-config-client-observable --save


Usage
-----

```js
const client = require("cloud-config-client-observable");
const obs = client.observe({
    application: "invoices"
});
obs.create("this.is.a.key")
  .subscribe(value => console.log(`The value is ${value}`));

```
Please, check the [examples folder](examples) for more examples.

Parameters:

* options (object, mandatory):
    * `endpoint` (string, optional, default: `http://localhost:8888`): Config server URL
    * `interval` (integer, optional, default: 30000): The interval for updating properties.
    * `application` (deprecated: use name): Load configuration for this app
    * `name` (string, mandatory): Load the configuration with this name
    * `profiles` (string array, optional, default: `["default"]`)
    * `label` (string, optional)
    * `auth` (object, optional): Basic Authentication for access config server (e.g.: `{ user: "username", pass: "password"}`). `endpoint` accepts also basic auth (e.g. `http://user:pass@localhost:8888`)
        * `user` (string)
        * `pass` (string)
* cb (function, optional): node style callback, if missing the method will return a promise.


References
----------
* [Spring Cloud Config Client for NodeJS](https://github.com/victorherraiz/cloud-config-client): Original project.
* [Spring Cloud Config](http://cloud.spring.io/spring-cloud-config/)

