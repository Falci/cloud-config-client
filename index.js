"use strict";

const http = require("http");
const URL = require("url");
const Rx = require("rx");
const DEFAULT_URL = URL.parse("http://localhost:8888");
const DEFAULT_INTERVAL = 30000;

function build(data) {
  return {
    get (prefix, key) {
      const fk = key ? prefix + "." + key : prefix;
      for (let item of data.propertySources) {
        const value = item.source[fk];
        if (value !== undefined) {
          return value;
        }
      }
    },
    forEach (func, include) {
      const set = new Set();
      for (let item of data.propertySources) {
        Object.keys(item.source).forEach((key) => {
          if (include) {
            func(key, item.source[key]);
          } else if (!set.has(key)) {
            func(key, item.source[key]);
            set.add(key);
          }
        });
      }
    },
    toString(spaces) {
      return JSON.stringify(data, null, spaces);
    }
  }
}

function getAuth(auth, url) {
  if (auth && auth.user && auth.pass) {
    return auth.user + ":" + auth.pass;
  }
  return url.auth;
}

function getPath(path, name, profiles, label) {
  const profilesStr = profiles ? profiles.join(",") : "default";
  return (path.endsWith("/") ? path : path + "/") +
    encodeURIComponent(name) + "/" +
    encodeURIComponent(profilesStr) +
    (label ? "/" + encodeURIComponent(label) : "");
}

function loadWithCallback(options, cb) {
  const endpoint = options.endpoint ? URL.parse(options.endpoint) : DEFAULT_URL;
  const name = options.name || options.application;
  http.request({
    protocol: endpoint.protocol,
    hostname: endpoint.hostname,
    port: endpoint.port,
    path: getPath(endpoint.path, name, options.profiles, options.label),
    auth: getAuth(options.auth, endpoint),
  }, (res) => {
    if (res.statusCode !== 200) { //OK
      res.resume(); // it consumes response
      return cb(new Error("Invalid response: " + res.statusCode));
    }
    let response = "";
    res.setEncoding("utf8");
    res.on("data", (data) => {
      response += data;
    });
    res.on("end", () => {
      try {
        const body = JSON.parse(response);
        cb(null, build(body));
      } catch (e) {
        cb(e);
      }
    });
  }).on("error", cb).end();
}

function loadWithPromise(options) {
  return new Promise((resolve, reject) => {
    loadWithCallback(options, (error, cfg) => {
      if (error) {
        reject(error);
      } else {
        resolve(cfg);
      }
    });
  });
}

function load(options, cb) {
  return typeof cb === "function" ?
    loadWithCallback(options, cb) :
    loadWithPromise(options);
}

function observe(options) {
  const observables = {};
  const interval = options.interval || DEFAULT_INTERVAL;
  const repeat = setInterval(tick, interval);

  function triggerObservables(config) {
    for (let key in observables) {
      const currentValue = config.get(key);
      if (currentValue !== observables[key].value) {
        observables[key].value = currentValue;
        observables[key].observable.onNext(currentValue);
      }
    }
  }

  function create(key) {
    return Rx.Observable.create(observe => {
      observables[key] = {
        observable: observe
      };
    });
  }

  function tick() {
    loadWithPromise(options)
      .then(triggerObservables);
  }

  function close() {
    for (let key in observables) {
      observables[key].observable.onCompleted();
    }

    return repeat && clearInterval(repeat);
  }

  tick();

  return {create, close};
}

module.exports = {observe, load};
