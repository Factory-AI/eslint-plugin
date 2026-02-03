'use strict';

const pkg = require('./package.json');
const rules = require('./rules');

module.exports = {
  meta: {
    name: pkg.name,
    version: pkg.version,
    namespace: '@factory',
  },
  rules,
  configs: {
    recommended: require('./configs/recommended'),
    base: require('./configs/base'),
    backend: require('./configs/backend'),
    frontend: require('./configs/frontend'),
  },
};
