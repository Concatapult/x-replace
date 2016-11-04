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


o("It conveniently inserts quotes when interpolating a tag attribute value", function () {
  var result = replace('<p a={{x}} b={{y}} c="{{z}}"></p>', { x: 10, y: '20', z: '30' })
  o(result).equals(`<p a='10' b='20' c="30"></p>`)
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


o("It can ignore other tags", function () {
  var result = replace(/^x\-/, `
    <p>One: {{ x }}</p>
    <template>Two: {{ x }}</template>
    <x-loop>Three: {{ x }}</x-loop>
`, { x: 10 })

  o(result).equals(`
    <p>One: 10</p>
    <template>Two: 10</template>
    <x-loop>Three: {{ x }}</x-loop>
`)
})


o("It replaces attributes of ignored tags", function () {
  var result = replace(/^(x\-|template)/, `<p>{{title}}</p><x-loop data='{{ data }}'>{{ name }}</x-loop>`, {
    title: "Hi!",
    data: ['Alice', 'Bob'],
    name: 'Not used',
  })

  o(result).equals(`<p>Hi!</p><x-loop data='["Alice","Bob"]'>{{ name }}</x-loop>`)
})


o("It interpolates objects", function () {
  var result = replace(`<p>Me: {{ obj }}</p>`, { obj: { x: 10 } })

  o(result).equals(`<p>Me: {"x":10}</p>`)
})


o("It replaces tag attribute names", function () {
  var result = replace(`<div data-{{flag}}="true"></div>`, { flag: 'x' })

  o(result).equals(`<div data-x="true"></div>`)
})
