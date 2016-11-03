var o = require('ospec')
var replace = require('../index')


o("It replaces basic values", function () {
  var result = replace('Hello, {{name}}!', { name: 'Alice' })
  o(result).equals('Hello, Alice!')
})


o("It replaces with object properties", function () {
  var result = replace('Hello, {{person.name}}!', { person: { name: 'Alice' } })
  o(result).equals('Hello, Alice!')
})


o("It ignores leading and trailing whitespace", function () {
  var result = replace('Hello, {{  name  }}!', { name: 'Alice' })
  o(result).equals('Hello, Alice!')

  var result = replace(`Hello, {{  
    person.name
  }}!`, { person: { name: 'Alice' } })
  o(result).equals('Hello, Alice!')
})


o("It ignores template tags", function () {
  var result = replace(`
    First: {{ x }}
    <p>Second: {{ x }}</p>
    <template>Third: {{ x }}</template>
    <b>Fourth: {{ x }}</b>
`, { x: 10 })

  o(result).equals(`
    First: 10
    <p>Second: 10</p>
    <template>Third: {{ x }}</template>
    <b>Fourth: 10</b>
`)
})


o("It ignores template tags within other tags", function () {
  var result = replace(`
    <p>One: {{ x }}
      <template>Two: {{ x }}</template>
    </p>
`, { x: 10 })

  o(result).equals(`
    <p>One: 10
      <template>Two: {{ x }}</template>
    </p>
`)
})
