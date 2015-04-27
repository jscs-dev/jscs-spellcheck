[![Build Status](https://travis-ci.org/jscs-dev/jscs-spellcheck.svg?branch=master)](https://travis-ci.org/jscs-dev/jscs-spellcheck)
[![Windows CI](https://ci.appveyor.com/api/projects/status/github/jscs-dev/jscs-spellcheck?svg=true)](https://ci.appveyor.com/project/jscs-dev/jscs-spellcheck/branch/master)
[![Coverage Status](https://img.shields.io/coveralls/jscs-dev/jscs-spellcheck.svg?style=flat)](https://coveralls.io/r/jscs-dev/jscs-spellcheck?branch=master)
[![Dependency Status](https://david-dm.org/jscs-dev/jscs-spellcheck.svg?theme=shields.io&style=flat)](https://david-dm.org/jscs-dev/jscs-spellcheck)
[![devDependency Status](https://david-dm.org/jscs-dev/jscs-spellcheck/dev-status.svg?theme=shields.io&style=flat)](https://david-dm.org/jscs-dev/jscs-spellcheck#info=devDependencies)

**JSCS Spellcheck** — Spellcheck plugin for [JSCS](https://github.com/jscs-dev/node-jscs/).

This JSCS plugin checks for words that can't be found in a dictionary, and tells
you where they are so that you can spell them correctly. You can choose which
dictionaries and languages to use. You can add more words and ignore existing
ones. You can define exceptions for names used by 3rd parties. You can even
restrict a word's usage to identifiers or property names only.

## Installation

`jscs-spellcheck` can be installed using NPM and requires
[jscs](https://github.com/jscs-dev/node-jscs/#installation).

Install it globally if you are using globally installed `jscs`:

    npm install jscs-spellcheck --global

But better install it into your project:

    npm install jscs-spellcheck --save-dev

## Usage

To use, add these lines to your `.jscsrc` configuration file:

```json
{
    "plugins": [ "jscs-spellcheck" ],
    "requireDictionaryWords": {
        "dictionaries": [ "english", "english/american" ]
    }
}
```

## Rules

### requireDictionaryWords

Only allow words defined in a dictionary or by you.

English language support is installed by default. To add additional
languages, go to the installation directory of JSCS and run `npm install
wordlist-LANGUAGE`, where LANGUAGE is the name of your language.

Type: `Boolean` or `Object`

Values:
 - `true`: use the `"english"` dictionary
 - `Object`:
   - `dictionaries`: (default `["english"]`) array of dictionary names including
     `"english"`, `"english/american"`, `"english/british"` and `"english/canadian"`
   - `allowWords`: additional words allowed anywhere
   - `allowWordsInIdentifiers`: additional words allowed only in identifiers
   - `allowWordsInProperties`: additional words allowed only in properties
   - `allowNames`: whole names ignored by spellcheck
   - `allowNamesAsIdentifiers`: whole names ignored by spellcheck when used as identifiers
   - `allowNamesAsProperties`: whole names ignored by spellcheck when used as properties
   - `excludeWords`: words to exclude from the dictionaries

#### Example

```js
"requireDictionaryWords": true

"requireDictionaryWords": {
    "dictionaries": [ "english", "english/american" ],
    "allowWords": [ "transclude" ],
    "allowWordsInProperties": [ "chmod" ],
    "allowNamesAsIdentifiers": [ "$stateParams", "util" ],
    "allowNamesAsProperties": [ "src" ],
    "excludeWords": [ "i" ]
}
```

##### Valid for mode `true`

```js
var number = 1;
object['source'] = 2;
object.source = 3;
fileDirectory = 4;
```

##### Invalid for mode `true`

```js
var num = 1;
obj['src'] = 2;
obj.src = 3;
fileDir = 4;
```

##### Valid for mode `"dictionaries": [ "english/american" ]`, invalid for `"english/british"`

```js
var color = 'papayawhip';
```

##### Valid for mode `"dictionaries": [ "english/british" ]`, invalid for `"english/american"`

```js
var colour = 'papayawhip';
```

##### Valid for mode `"allowWords": [ "transclude" ]`

```js
var transclude = function() {};
var transcludeFunction = function() {};
return { transclude: function() {} };
```

##### Valid for mode `"allowWordsInProperties": [ "chmod" ]`

```js
var mode = 0777;
fs.chmod('/', mode, function(error) {});
fs.chmodSync('/', mode);
```

##### Invalid for mode `"allowWordsInProperties": [ "chmod" ]`

```js
var chmod = 0777;
```

##### Valid for mode `"allowNamesAsIdentifiers": [ "$stateParams", "util" ]`

```js
var util = require('util');
function Controller($stateParams) {}
```

##### Invalid for mode `"allowNamesAsIdentifiers": [ "$stateParams", "util" ]`

```js
var stringUtil = {};
var params = {};
```

##### Valid for mode `"allowNamesAsProperties": [ "src" ]`

```js
element.src = 'https://youtu.be/dQw4w9WgXcQ';
```

##### Invalid for mode `"allowNamesAsProperties": [ "src" ]`

```js
var data = { videoSrc: 'youtube' };
```

##### Invalid for mode `"excludeWords": [ "i" ]`

```js
for (var i = 0; i < array.length; i++) {}
```

#### Error Suppression

You can also allow (and later disallow) words on a per-file (or per-line)
basis:

```js
// jscs:allowWords concat, dest, dist, src
grunt.initConfig({
    concat: {
        dist: {
            src: ['src/*.js'],
            dest: 'dist/scripts.js'
        }
    }
});
```

```js
// jscs:allowNamesAsIdentifiers EOL
var EOL = require('os').EOL;
// jscs:disallowNamesAsIdentifiers EOL

if (age > 80) var reachingEol = true; // invalid
```
