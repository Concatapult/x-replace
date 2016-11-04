# x-replace

`x-replace` is a function that replaces simple key-value pairs with a template string. The primary difference between `x-replace` and other string templating libraries is that it can **ignore the contents of specified html tags**.

Features:

- Ignores the **contents** of `<template>` tags by default (configurable) to be friendly with web components
- Automatically wraps quotes around interpolated tag attribute values
- Completely logic-less
- Written in ES5, so can be used in both node.js and the browser.

## Example Usage

By default, `x-replace` ignores the contents of html5 `<template>` tags:

```js
var replace = require('x-replace')

replace("{{x}}<template>{{y}}</template>{{y}}", { x: 10, y: 20 })
//=> "10<template>{{y}}</template>20"
```

But you can also specify your own regular expression for which tags to ignore:

```js
replace(/^(x\-|template)/, "<p>{{title}}</p><x-loop data={{ people }}>{{ name }}</x-loop>", {
  title: "Hi!",
  data: [{ name: 'Alice' }, { name: 'Bob' }],
  name: 'Not used',
})
//=> "<p>Hi!</p><x-loop data='[{"name":"Alice"},{"name":"Bob"}]'>{{ name }}</x-loop>"
```

### XSS

By default, `x-replace` escapes html characters to prevent xss:

```js
replace("<p>{{ userContent }}</p>", { userContent: '<script>alert("hi")</script>' })
//=> "<p>&lt;script&gt;alert('hi')&lt;/script&gt;</p>"
```

However, you can insert raw values when you need to by using an equal `=`:

```js
replace("<p>{{= userContent }}</p>", { userContent: '<script>alert("hi")</script>' })
//=> "<p><script>alert("hi")</script></p>"
```

### JSON in Tag Attributes

Sometimes you want to insert JSON into an attribute of a custom element:

```html
<user-profile user={{ userObject }}></user-profile>
```

However, there is one caveat – in order to be valid HTML, single quotes `'` are replaced by `&#39;`. For example:

```js
var template = "<user-profile user={{ userObject }}></user-profile>"
var result = replace(template, { userObject: { name: "Mr. O'Brian" } })
//=> "<user-profile user='{"name":"Mr. O&#39;Brian"}'></user-profile>"
```

In order to get back to the original within your web components JS, you will need to use `decodeHtmlAttr`:

```js
var jsonAttr = '{"name":"Mr. O&#39;Brian"}'
var decoded  = replace.decodeHtmlAttr( jsonAttr )
//=> '{"name":"Mr. O\'Brian"}'
JSON.parse(decoded)
//=> { name: "Mr. O'Brian" }
```

## Why no loops / logic?

[Web Components](http://webcomponents.org/) pave the way for handling custom presentation logic in the browser. In the same vein, [Server Components](https://github.com/pimterry/server-components) will be ideal for handling such logic on the server-side.

In other words, if you need to loop, you should write or use a loop component. If you need to conditionally show/hide content, you should write / use an `if` component. This is the ideal way forward.
