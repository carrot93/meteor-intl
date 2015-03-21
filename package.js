Package.describe({
  name: 'benoitt:intl',
  version: '0.9.1',
  summary: 'Meteor helpers for internationalization',
  git: 'https://github.com/eXon/meteor-intl.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.4.2');

  api.addFiles('node_modules/intl/Intl.complete.js');
  api.addFiles('dist/meteor-intl-with-locales.js');

  // TODO: Give the option to only load the languages they need
  //api.addFiles('dist/meteor-intl.js');
  //api.addFiles('dist/locale-data/fr.js');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('benoitt:intl');
  api.addFiles('tests/helpers.js');
});