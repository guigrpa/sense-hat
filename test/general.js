import test from 'ava';
if (process.env.TEST_MINIFIED_LIB) {
  var index = require('../lib/es5/index.min');
} else {
  var index = require('../lib/es5/index');
}

test('sanity', t => {
  t.true(true);
});
