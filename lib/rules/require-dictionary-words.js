/**
 * Only allow words defined in a dictionary or by you.
 *
 * English language support is installed by default. To add additional
 * languages, go to the installation directory of JSCS and run `npm install
 * wordlist-LANGUAGE`, where LANGUAGE is the name of your language.
 *
 * Type: `Boolean` or `Object`
 *
 * Values:
 *  - `true`: use the `"english"` dictionary
 *  - `Object`:
 *    - `dictionaries`: (default `["english"]`) array of dictionary names including
 *      `"english"`, `"american"`, `"british"` and `"canadian"`
 *    - `allowWords`: additional words allowed anywhere
 *    - `allowWordsInIdentifiers`: additional words allowed only in identifiers
 *    - `allowWordsInProperties`: additional words allowed only in properties
 *    - `allowNames`: whole names ignored by spellcheck
 *    - `allowNamesAsIdentifiers`: whole names ignored by spellcheck when used as identifiers
 *    - `allowNamesAsProperties`: whole names ignored by spellcheck when used as properties
 *    - `excludeWords`: words to exclude from the dictionaries
 *
 * #### Example
 *
 * ```js
 * "requireDictionaryWords": true
 *
 * "requireDictionaryWords": {
 *     "dictionaries": [ "english", "american" ],
 *     "allowWords": [ "transclude" ],
 *     "allowWordsInProperties": [ "chmod" ],
 *     "allowNamesAsIdentifiers": [ "$stateParams", "util" ],
 *     "allowNamesAsProperties": [ "src" ],
 *     "excludeWords": [ "i" ]
 * }
 * ```
 *
 * ##### Valid for mode `true`
 *
 * ```js
 * var number = 1;
 * object['source'] = 2;
 * object.source = 3;
 * fileDirectory = 4;
 * ```
 *
 * ##### Invalid for mode `true`
 *
 * ```js
 * var num = 1;
 * obj['src'] = 2;
 * obj.src = 3;
 * fileDir = 4;
 * ```
 *
 * ##### Valid for mode `"dictionaries": [ "american" ]`, invalid for `"british"`
 *
 * ```js
 * var color = 'papayawhip';
 * ```
 *
 * ##### Valid for mode `"dictionaries": [ "british" ]`, invalid for `"american"`
 *
 * ```js
 * var colour = 'papayawhip';
 * ```
 *
 * ##### Valid for mode `"allowWords": [ "transclude" ]`
 *
 * ```js
 * var transclude = function() {};
 * var transcludeFunction = function() {};
 * return { transclude: function() {} };
 * ```
 *
 * ##### Valid for mode `"allowWordsInProperties": [ "chmod" ]`
 *
 * ```js
 * var mode = 0777;
 * fs.chmod('/', mode, function(error) {});
 * fs.chmodSync('/', mode);
 * ```
 *
 * ##### Invalid for mode `"allowWordsInProperties": [ "chmod" ]`
 *
 * ```js
 * var chmod = 0777;
 * ```
 *
 * ##### Valid for mode `"allowNamesAsIdentifiers": [ "$stateParams", "util" ]`
 *
 * ```js
 * var util = require('util');
 * function Controller($stateParams) {}
 * ```
 *
 * ##### Invalid for mode `"allowNamesAsIdentifiers": [ "$stateParams", "util" ]`
 *
 * ```js
 * var stringUtil = {};
 * var params = {};
 * ```
 *
 * ##### Valid for mode `"allowNamesAsProperties": [ "src" ]`
 *
 * ```js
 * element.src = 'https://youtu.be/dQw4w9WgXcQ';
 * ```
 *
 * ##### Invalid for mode `"allowNamesAsProperties": [ "src" ]`
 *
 * ```js
 * var data = { videoSrc: 'youtube' };
 * ```
 *
 * ##### Invalid for mode `"excludeWords": [ "i" ]`
 *
 * ```js
 * for (var i = 0; i < array.length; i++) {}
 * ```
 *
 * #### Error Suppression
 *
 * You can also allow (and later disallow) words on a per-file (or per-line)
 * basis:
 *
 * ```js
 * // jscs:allowWords concat, dest, dist, src
 * grunt.initConfig({
 *     concat: {
 *         dist: {
 *             src: ['src/*.js'],
 *             dest: 'dist/scripts.js'
 *         }
 *     }
 * });
 * ```
 *
 * ```js
 * // jscs:allowNamesAsIdentifiers EOL
 * var EOL = require('os').EOL;
 * // jscs:disallowNamesAsIdentifiers EOL
 *
 * if (age > 80) var reachingEol = true; // invalid
 * ```
 */

var assert = require('assert');
var assign = require('lodash.assign');
var indexOf = require('lodash.indexof');

var wordlistMap = {
    english: 'wordlist-english',
    american: 'wordlist-english',
    british: 'wordlist-english',
    canadian: 'wordlist-english',
};

// Breaks names like "fooBar" into ["foo", "bar"], etc.
var reWords = (function() {
    var upper = '[A-Z\\xc0-\\xd6\\xd8-\\xde]';
    var lower = '[a-z\\xdf-\\xf6\\xf8-\\xff]+';

    return RegExp(upper + '+(?=' + upper + lower + ')|' + upper + '?' + lower + '|' + upper + '+|[0-9]+', 'g');
}());

function hasWord(dictionary, word) {
    return indexOf(dictionary, word, true) > -1;
}

function dictionariesHaveWord(dictionaries, word) {
    return dictionaries.some(function(dictionary) {
        return hasWord(dictionary, word);
    });
}

function checkWords(dictionaries, excluded, errors, words, start) {
    // Use String.prototype.replace to iterate over the words because it
    // provides an offset value useful for pinpointing a word's location.
    String(words).replace(reWords, function(word, offset) {
        word = word.toLowerCase();
        // Numbers may occasionally get orphaned; just ignore them.
        if (/^[0-9]*$/.test(word)) {
            return;
        }
        var hadWord;
        // Always ignore excluded words.
        if (hasWord(excluded, word)) {
            hadWord = false;
        } else {
            hadWord = dictionariesHaveWord(dictionaries, word);
        }
        if (!hadWord) {
            var location;
            if (offset === 0) {
                location = start;
            } else {
                location = assign({}, start);
                location.column += offset;
            }
            errors.add('Non-dictionary word "' + word + '"', location);
        }
    });
}

function isSignificantNode(node) {
    // Identifier and MemberExpression nodes always have parents, and those are
    // the only nodes that are passed to this function.
    return (
        (node.parentNode.type === 'VariableDeclarator' &&
         node.parentNode.id === node) ||
        (node.parentNode.type === 'AssignmentExpression' &&
         node.parentNode.left === node) ||
        node.parentNode.type === 'FunctionDeclaration' ||
        node.parentNode.type === 'FunctionExpression' ||
        node.parentNode.type === 'ClassDeclaration' ||
        node.parentNode.type === 'MethodDefinition' ||
        node.parentNode.type === 'LabeledStatement'
    );
}

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        var wasObject = typeof options === 'object' && options !== null;
        assert(
            options === true || wasObject,
            this.getOptionName() + ' option requires a true or object value ' +
                'or should be removed'
        );

        var wordDictionaries = ['english'];
        var allowedWords;
        var allowedIdentifierWords;
        var allowedPropertyWords;
        var allowedNames;
        var allowedIdentifierNames;
        var allowedPropertyNames;
        var excludedWords;

        function arrayOption(option) {
            var value = options[option];
            if (value !== undefined) {
                assert(
                    Array.isArray(value),
                    'requireDictionaryWords.' + option + ' option requires ' +
                        'an array value or should be removed'
                );
            }
            return value;
        }

        if (wasObject) {
            wordDictionaries = arrayOption('dictionaries') || wordDictionaries;
            allowedWords = arrayOption('allowWords');
            allowedIdentifierWords = arrayOption('allowWordsInIdentifiers');
            allowedPropertyWords = arrayOption('allowWordsInProperties');
            allowedNames = arrayOption('allowNames');
            allowedIdentifierNames = arrayOption('allowNamesAsIdentifiers');
            allowedPropertyNames = arrayOption('allowNamesAsProperties');
            excludedWords = arrayOption('excludeWords');
        }

        this._wordDictionaries = wordDictionaries.map(function(language) {
            var packageName = wordlistMap.hasOwnProperty(language) ?
                    // Special case where one package holds many wordlists.
                    wordlistMap[language] :
                    // General case where a package is one-to-one with a
                    // wordlist.
                    'wordlist-' + language;
            var wordlist;
            try {
                wordlist = require(packageName);
            } catch (error) {
                throw new Error(
                    'Package "' + packageName + '" is not installed but required ' +
                        'for spell-checking. Go to the installation directory of ' +
                        'JSCS and run "npm install ' + packageName + '"'
                );
            }
            return wordlist[language];
        });
        if (allowedWords) {
            this._wordDictionaries.push(allowedWords);
        }

        this._identifierWordDictionaries = this._wordDictionaries.slice();
        if (allowedIdentifierWords) {
            this._identifierWordDictionaries.push(allowedIdentifierWords);
        }

        this._propertyWordDictionaries = this._wordDictionaries.slice();
        if (allowedPropertyWords) {
            this._propertyWordDictionaries.push(allowedPropertyWords);
        }

        this._nameDictionaries = [];
        if (allowedNames) {
            this._nameDictionaries.push(allowedNames);
        }

        this._identifierNameDictionaries = this._nameDictionaries.slice();
        if (allowedIdentifierNames) {
            this._identifierNameDictionaries.push(allowedIdentifierNames);
        }

        this._propertyNameDictionaries = this._nameDictionaries.slice();
        if (allowedPropertyNames) {
            this._propertyNameDictionaries.push(allowedPropertyNames);
        }

        this._excludedWords = excludedWords;
    },

    getOptionName: function() {
        return 'requireDictionaryWords';
    },

    check: function(file, errors) {
        var _this = this;

        var allowedIndex = [];

        function addToAllowedIndex(allowed, rule, namesStr, line) {
            namesStr.split(',').forEach(function(name) {
                name = name.trim();

                if (!name) {
                    return;
                }

                allowedIndex.push({
                    rule: rule,
                    name: name,
                    allowed: allowed,
                    line: line
                });
            });
        }

        function buildAllowedIndex() {
            var comments = file.getComments();
            var commentRe = new RegExp([
                '(jscs\\s*:\\s*(allow|disallow)(',
                [
                    'Words',
                    'WordsInIdentifiers',
                    'WordsInProperties',
                    'Names',
                    'NamesAsIdentifiers',
                    'NamesAsProperties'
                ].join('|'),
                '))\\s+([\\s\\S]*)',
            ].join(''));

            comments.forEach(function(comment) {
                var allowed;
                var parsed = commentRe.exec(comment.value.trim());

                if (!parsed || parsed.index !== 0) {
                    return;
                }

                allowed = parsed[2] === 'allow';
                var rule = 'allow' + parsed[3];
                var namesStr = parsed[4];
                addToAllowedIndex(allowed, rule, namesStr, comment.loc.start.line);
            }, this);
        }

        buildAllowedIndex();

        function isAllowed(context, name, line) {
            var allowed = false;
            allowedIndex.some(function(region) {
                // once the comment we're inspecting occurs after the location of the error,
                // no longer check for whether the state is allowed or disallow
                if (region.line > line) {
                    return true;
                }

                var inverseContextRe = new RegExp(
                    (context === 'identifier' ? 'Properties' : 'Identifiers') + '$'
                );

                if (inverseContextRe.test(region.rule)) {
                    return;
                }

                if (/^allowNames/.test(region.rule)) {
                    if (region.name === name) {
                        allowed = region.allowed;
                    }
                } else if (/^allowWords/.test(region.rule)) {
                    if (name.match(reWords).indexOf(region.name) > -1) {
                        allowed = region.allowed;
                    }
                }
            });

            return allowed;
        }

        function check(context, wordDictionaries, nameDictionaries, name, start) {
            if (
                isAllowed(context, name, start.line) ||
                dictionariesHaveWord(nameDictionaries, name)
            ) {
                return;
            }
            checkWords(
                wordDictionaries,
                _this._excludedWords,
                errors,
                name,
                start
            );
        }

        function checkIdentifier(name, start) {
            check(
                'identifier',
                _this._identifierWordDictionaries,
                _this._identifierNameDictionaries,
                name,
                start
            );
        }

        function checkProperty(name, start) {
            check(
                'property',
                _this._propertyWordDictionaries,
                _this._propertyNameDictionaries,
                name,
                start
            );
        }

        file.iterateNodesByType('Identifier', function(node) {
            if (!isSignificantNode(node)) {
                return;
            }
            checkIdentifier(node.name, node.loc.start);
        });

        file.iterateNodesByType('MemberExpression', function(node) {
            if (!isSignificantNode(node)) {
                return;
            }
            if (node.property.type === 'Identifier' && !node.computed) {
                checkProperty(node.property.name, node.property.loc.start);
            } else if (node.property.type === 'Literal') {
                checkProperty(node.property.value, node.property.loc.start);
            }
        });

        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(prop) {
                var key = prop.key;
                if (key.type === 'Identifier') {
                    checkProperty(key.name, key.loc.start);
                } else if (key.type === 'Literal') {
                    checkProperty(key.value, key.loc.start);
                }
            });
        });
    }

};
