import test from 'japa'

test.group('Example', () => {
  test('assert sum of 2 numbers', (assert) => {
    assert.equal(2 + 2, 4)
  })
})
