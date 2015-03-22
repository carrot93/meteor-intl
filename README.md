Meteor Intl
===================

This library provides Meteor helpers for internationalization. The helpers provide a declarative way to format dates, numbers, and string messages with pluralization support.

Overview
--------

**Meteor Intl is an unofficial rewrite of Handlebar Intl using [FormatJS][]**

### Features

- Display numbers with separators.
- Display dates and times correctly.
- Display dates relative to "now".
- Pluralize labels in strings.
- Support for 200+ languages.
- Runs in the browser and Node.js.
- Built on standards.

### Example

There are many examples [on the website][FormatJS], but here's a comprehensive one:

```handlebars
<template name="page">
  {{formatMessage intlName='messages.post.meta' num=0}}
  {{formatNumber 1000 style="currency" currency="USD"}}
</template>
```

```js
Template.layout.onCreated(function() {
  this.data.intl = {
    locales: ['en-US'],
    messages: {}
  }
});

Template.page.onCreated(function() {
  this.data.intl.messages.post = {
    meta: 'You have {num, plural, =0{no comment} one{# comment} other{# comments}}'
  };
});
```

This example would render: **"You have no comment $1,000.00"** to the `html` variable. The `post.meta` message is written in the industry standard [ICU Message syntax][], which you can also learn about on the [FormatJS website][FormatJS].

Contribute
----------

Let's make Meteor Intl and FormatJS better! If you're interested in helping, all contributions are welcome and appreciated. Meteor Intl is just one of many packages that make up the [FormatJS suite of packages][FormatJS GitHub], and you can contribute to any/all of them, including the [Format JS website][FormatJS] itself.

Check out the [Contributing document][CONTRIBUTING] for the details. Thanks!


License
-------

This software is free to use under the Yahoo! Inc. BSD license.
See the [LICENSE file][LICENSE] for license text and copyright information.


[FormatJS]: http://formatjs.io/
[FormatJS GitHub]: http://formatjs.io/github/
[ICU Message syntax]: http://formatjs.io/guide/#messageformat-syntax
[CONTRIBUTING]: https://github.com/eXon/meteor-intl/blob/master/CONTRIBUTING.md
[LICENSE]: https://github.com/eXon/meteor-intl/blob/master/LICENSE
