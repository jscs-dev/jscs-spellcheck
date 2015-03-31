[![Build Status](https://travis-ci.org/jscs-dev/jscs-spellcheck.svg?branch=master)](https://travis-ci.org/jscs-dev/jscs-spellcheck)
[![Windows CI](https://ci.appveyor.com/api/projects/status/github/jscs-dev/jscs-spellcheck?svg=true)](https://ci.appveyor.com/project/jscs-dev/jscs-spellcheck/branch/master)
[![Coverage Status](https://img.shields.io/coveralls/jscs-dev/jscs-spellcheck.svg?style=flat)](https://coveralls.io/r/jscs-dev/jscs-spellcheck?branch=master)
[![Dependency Status](https://david-dm.org/jscs-dev/jscs-spellcheck.svg?theme=shields.io&style=flat)](https://david-dm.org/jscs-dev/jscs-spellcheck)
[![devDependency Status](https://david-dm.org/jscs-dev/jscs-spellcheck/dev-status.svg?theme=shields.io&style=flat)](https://david-dm.org/jscs-dev/jscs-spellcheck#info=devDependencies)

**JSCS Spellcheck** — Spellcheck plugin for [JSCS](https://github.com/jscs-dev/node-jscs/).

The majority of time spent programming is not spent typing, but in reading and
maintaining existing code. It is important that other programmers be able to
understand exactly what is going on in a complex system.

Abbreviations and contractions can make code harder to understand. They can be
ambiguous and arbitrary. Abbreviations cannot be distinguished from
misspellings. Today, there are free integrated development environments which
provide word auto-completion and line wrapping; there is no practical advantage
to using abbreviations in code.

This JSCS plugin checks for words that can't be found in a dictionary, and tells
you where they are so that you can spell them correctly. You can choose which
dictionaries and languages to use. You can add more words and ignore existing
ones. You can define exceptions for names used by 3rd parties. You can even
restrict a word's usage to property names only.

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
        "dictionaries": [ "english", "american" ]
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
     `"english"`, `"american"`, `"british"` and `"canadian"`
   - `allowWordsInIdentifiersAndProperties`: additional words allowed anywhere
   - `allowWordsInProperties`: additional words allowed only as properties
   - `allowNamesForIdentifiersAndProperties`: names ignored by spellcheck
   - `allowNamesForProperties`: names ignored by spellcheck when used as properties
   - `excluded`: words to exclude from the dictionaries

#### Example

```js
"requireDictionaryWords": true

"requireDictionaryWords": {
    "dictionaries": [ "english", "american" ],
    "allowWordsInIdentifiersAndProperties": [ "transclude" ],
    "allowWordsInProperties": [ "chmod" ],
    "allowNamesForIdentifiersAndProperties": [ "$stateParams", "util" ],
    "allowNamesForProperties": [ "src" ],
    "excluded": [ "i" ]
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

##### Valid for mode `"dictionaries": [ "american" ]`, invalid for `"british"`

```js
var color = 'papayawhip';
```

##### Valid for mode `"dictionaries": [ "british" ]`, invalid for `"american"`

```js
var colour = 'papayawhip';
```

##### Valid for mode `"allowWordsInIdentifiersAndProperties": [ "transclude" ]`

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

##### Valid for mode `"allowNamesForIdentifiersAndProperties": [ "$stateParams", "util" ]`

```js
var util = require('util');
function Controller($stateParams) {}
```

##### Invalid for mode `"allowNamesForIdentifiersAndProperties": [ "$stateParams", "util" ]`

```js
var stringUtil = {};
var params = {};
```

##### Valid for mode `"allowNamesForProperties": [ "src" ]`

```js
element.src = 'https://youtu.be/dQw4w9WgXcQ';
```

##### Invalid for mode `"allowNamesForProperties": [ "src" ]`

```js
var data = { videoSrc: 'youtube' };
```

##### Invalid for mode `"excluded": [ "i" ]`

```js
for (var i = 0; i < array.length; i++) {}
```
