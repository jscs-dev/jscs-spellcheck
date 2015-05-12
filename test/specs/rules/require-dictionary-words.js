var plugin = require('../../..');

var Checker = require('jscs/lib/checker');
var assert = require('assert');

describe('plugin', function() {
    var called = false;
    plugin({
        registerRule: function(Rule) {
            var rule = new Rule();
            assert(typeof rule.configure === 'function');
            assert(typeof rule.getOptionName === 'function');
            assert(typeof rule.check === 'function');
            called = true;
        }
    });
    assert(called);
});

describe('rules/require-dictionary-words', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ plugins: [plugin] });
    });

    describe('true', function() {
        beforeEach(function() {
            checker.configure({ requireDictionaryWords: true });
        });

        it('should report non-words', function() {
            assert(checker.checkString('asdf = 1;').getErrorCount() === 1);
            assert(checker.checkString('var asdf = 1;').getErrorCount() === 1);
            assert(checker.checkString('let asdf = 1;').getErrorCount() === 1);
            assert(checker.checkString('const asdf = 1;').getErrorCount() === 1);
            assert(checker.checkString('function asdf(jkl) {var asdf = 1;}').getErrorCount() === 3);
            assert(checker.checkString('var asdf = function asdf() {};').getErrorCount() === 2);
            assert(checker.checkString('for(asdf = 0; asdf<1; asdf++){asdf;}').getErrorCount() === 1);
            assert(checker.checkString('object["jkl"] = 1;').getErrorCount() === 1);
            assert(checker.checkString('object.jkl = 1;').getErrorCount() === 1);
            assert(checker.checkString('object = {jkl: 1};').getErrorCount() === 1);
            assert(checker.checkString('object = {"jkl": 1};').getErrorCount() === 1);
            assert(checker.checkString('asdf: void 0;').getErrorCount() === 1);

            assert(checker.checkString('JKL = 1;').getErrorCount() === 1);
        });

        it('should report multiple non-words', function() {
            assert(checker.checkString('asdfAsdf = 1;').getErrorCount() === 2);
            assert(checker.checkString('asdfASDF = 1;').getErrorCount() === 2);
            assert(checker.checkString('asdfASDFAsdf = 1;').getErrorCount() === 3);
            assert(checker.checkString('asdf_asdf = 1;').getErrorCount() === 2);
        });

        it('should ignore numbers and symbols', function() {
            assert(checker.checkString('$asdfAsdf = 1;').getErrorCount() === 2);
            assert(checker.checkString('asdf$Asdf = 1;').getErrorCount() === 2);
            assert(checker.checkString('asdfAsdf$ = 1;').getErrorCount() === 2);
            assert(checker.checkString('asdf9Asdf = 1;').getErrorCount() === 2);
            assert(checker.checkString('asdfAsdf9 = 1;').getErrorCount() === 2);
        });

        it('should not report non-"instantiation" usages', function() {
            assert(checker.checkString('asdf').isEmpty());
            assert(checker.checkString('asdf.jkl').isEmpty());
            assert(checker.checkString('asdf(jkl)').isEmpty());
            assert(checker.checkString('asdf.jkl(jkl)').isEmpty());
            assert(checker.checkString('value = asdf').isEmpty());
            assert(checker.checkString('var value = asdf').isEmpty());
            assert(checker.checkString('object.property = asdf').isEmpty());
            assert(checker.checkString('if(asdf){}').isEmpty());
            assert(checker.checkString('object[jkl] = 1;').isEmpty());
        });

        it('should not report defined words', function() {
            assert(checker.checkString('good = 1;').isEmpty());
        });

        it('should not report multiple defined words', function() {
            assert(checker.checkString('goodGood = 1;').isEmpty());
        });
    });

    describe('esnext', function() {
        beforeEach(function() {
            checker.configure({ requireDictionaryWords: true, esnext: true });
        });

        it('should report non-words in es6', function() {
            assert(checker.checkString('object = {asdf, jkl() {}, [0 + 1]: 2};').getErrorCount() === 2);
            assert(checker.checkString('class Asdf { jkl() {} }').getErrorCount() === 2);
        });

        it('should not report defined words in es6', function() {
            assert(checker.checkString('object = {good, good() {}, [0 + 1]: 2};').isEmpty());
            assert(checker.checkString('class Good { good() {} }').isEmpty());
        });
    });

    describe('allowWords', function() {
        beforeEach(function() {
            checker.configure({
                requireDictionaryWords: {
                    allowWords: ['asdf', 'jkl']
                }
            });
        });

        it('should not report allowed words', function() {
            assert(checker.checkString('asdf = 1;').isEmpty());
            assert(checker.checkString('object.jkl = 1;').isEmpty());
            assert(checker.checkString('asdfAsdf = 1;').isEmpty());
            assert(checker.checkString('object.jklJkl = 1;').isEmpty());
        });
    });

    describe('allowNames', function() {
        beforeEach(function() {
            checker.configure({
                requireDictionaryWords: {
                    allowNames: ['asdf', 'jkl']
                }
            });
        });

        it('should report names used as parts of names', function() {
            assert(checker.checkString('asdfAsdf = 1;').getErrorCount() === 2);
            assert(checker.checkString('object.jklJkl = 1;').getErrorCount() === 2);
        });

        it('should not report allowed names', function() {
            assert(checker.checkString('asdf = 1;').isEmpty());
            assert(checker.checkString('object.jkl = 1;').isEmpty());
        });
    });

    describe('allowWordsInIdentifiers', function() {
        beforeEach(function() {
            checker.configure({
                requireDictionaryWords: {
                    allowWordsInIdentifiers: ['asdf', 'jkl']
                }
            });
        });

        it('should report non-words in properties', function() {
            assert(checker.checkString('object.jkl = 1;').getErrorCount() === 1);
            assert(checker.checkString('object.jklJkl = 1;').getErrorCount() === 2);
        });

        it('should not report allowed words in identifiers', function() {
            assert(checker.checkString('asdf = 1;').isEmpty());
            assert(checker.checkString('asdfAsdf = 1;').isEmpty());
        });
    });

    describe('allowWordsInProperties', function() {
        beforeEach(function() {
            checker.configure({
                requireDictionaryWords: {
                    allowWordsInProperties: ['asdf', 'jkl']
                }
            });
        });

        it('should report non-words in identifiers', function() {
            assert(checker.checkString('asdf = 1;').getErrorCount() === 1);
            assert(checker.checkString('asdfAsdf = 1;').getErrorCount() === 2);
        });

        it('should not report allowed words in properties', function() {
            assert(checker.checkString('object.jkl = 1;').isEmpty());
            assert(checker.checkString('object.jklJkl = 1;').isEmpty());
        });
    });

    describe('allowNamesAsIdentifiers', function() {
        beforeEach(function() {
            checker.configure({
                requireDictionaryWords: {
                    allowNamesAsIdentifiers: ['asdf', 'jkl']
                }
            });
        });

        it('should report non-names and properties', function() {
            assert(checker.checkString('asdfAsdf = 1;').getErrorCount() === 2);
            assert(checker.checkString('object.jkl = 1;').getErrorCount() === 1);
            assert(checker.checkString('object.jklJkl = 1;').getErrorCount() === 2);
        });

        it('should not report allowed names as identifiers', function() {
            assert(checker.checkString('asdf = 1;').isEmpty());
        });
    });

    describe('allowNamesAsProperties', function() {
        beforeEach(function() {
            checker.configure({
                requireDictionaryWords: {
                    allowNamesAsProperties: ['asdf', 'jkl']
                }
            });
        });

        it('should report non-names and identifiers', function() {
            assert(checker.checkString('asdf = 1;').getErrorCount() === 1);
            assert(checker.checkString('asdfAsdf = 1;').getErrorCount() === 2);
            assert(checker.checkString('object.jklJkl = 1;').getErrorCount() === 2);
        });

        it('should not report allowed names as properties', function() {
            assert(checker.checkString('object.jkl = 1;').isEmpty());
        });
    });

    describe('excludeWords', function() {
        beforeEach(function() {
            checker.configure({
                requireDictionaryWords: {
                    excludeWords: ['good']
                }
            });
        });

        it('should report excluded words', function() {
            assert(checker.checkString('good = 1;').getErrorCount() === 1);
            assert(checker.checkString('object.good = 1;').getErrorCount() === 1);
        });
    });

    describe('dictionaries', function() {
        describe('english', function() {
            beforeEach(function() {
                checker.configure({
                    requireDictionaryWords: {
                        dictionaries: ['english']
                    }
                });
            });

            it('should report non-words', function() {
                assert(checker.checkString('color = 1;').getErrorCount() === 1);
            });
        });

        describe('english, american', function() {
            beforeEach(function() {
                checker.configure({
                    requireDictionaryWords: {
                        dictionaries: ['english', 'english/american']
                    }
                });
            });

            it('should not report defined words', function() {
                assert(checker.checkString('color = 1;').isEmpty());
            });
        });

        describe('missing dictionary', function() {
            it('should throw an informative error', function() {
                var missingLanguage = 'elvish';
                assert.throws(function() {
                    checker.configure({
                        requireDictionaryWords: {
                            dictionaries: [missingLanguage]
                        }
                    });
                }, new RegExp('wordlist-' + missingLanguage));
            });
        });
    });

    describe('inline configuration', function() {
        beforeEach(function() {
            checker.configure({ requireDictionaryWords: true });
        });

        it('should split', function() {
            assert(checker.checkString([
                '// jscs:allowWords',
                'asdf = 1',
                'jkl = 1'
            ].join('\n')).getErrorCount() === 2);
            assert(checker.checkString([
                '// jscs:allowWords asdf',
                'asdf = 1',
                'jkl = 1'
            ].join('\n')).getErrorCount() === 1);
            assert(checker.checkString([
                '// jscs:allowWords asdf, jkl',
                'asdf = 1',
                'jkl = 1'
            ].join('\n')).isEmpty());
            assert(checker.checkString([
                '// jscs:allowWords asdf, jkl,',
                'asdf = 1',
                'jkl = 1'
            ].join('\n')).isEmpty());
            assert(checker.checkString([
                '/* jscs:allowWords',
                ' asdf, jkl */',
                'asdf = 1',
                'jkl = 1'
            ].join('\n')).isEmpty());
            assert(checker.checkString([
                '/* jscs:allowWords',
                ' asdf,',
                ' jkl */',
                'asdf = 1',
                'jkl = 1'
            ].join('\n')).isEmpty());
        });

        it('should later allow and later disallow inline', function() {
            assert(checker.checkString([
                'asdf = 1',
                '// jscs:allowWords asdf, jkl',
                'asdf = 1',
                '// jscs:disallowWords asdf, jkl',
                'asdf = 1'
            ].join('\n')).getErrorCount() === 2);

            assert(checker.checkString([
                'asdf = 1',
                'jkl = 1',
                '// jscs:allowWords asdf, jkl',
                'asdf = 1',
                'jkl = 1',
                '// jscs:disallowWords asdf, jkl',
                'asdf = 1',
                'jkl = 1'
            ].join('\n')).getErrorCount() === 4);
        });

        it('should allow words inline', function() {
            assert(checker.checkString([
                '// jscs:allowWords asdf, jkl',
                'asdf = 1',
                'asdfAsdf = 1',
                'object.jkl = 1',
                'object.jklJkl = 1'
            ].join('\n')).isEmpty());
        });

        it('should allow words in identifiers inline', function() {
            assert(checker.checkString([
                '// jscs:allowWordsInIdentifiers asdf, jkl',
                'asdf = 1',
                'asdfAsdf = 1'
            ].join('\n')).isEmpty());
            assert(checker.checkString([
                '// jscs:allowWordsInIdentifiers asdf, jkl',
                'object.jkl = 1',
                'object.jklJkl = 1'
            ].join('\n')).getErrorCount() === 3);
        });

        it('should allow words in properties inline', function() {
            assert(checker.checkString([
                '// jscs:allowWordsInProperties asdf, jkl',
                'object.jkl = 1',
                'object.jklJkl = 1'
            ].join('\n')).isEmpty());
            assert(checker.checkString([
                '// jscs:allowWordsInProperties asdf, jkl',
                'asdf = 1',
                'asdfAsdf = 1'
            ].join('\n')).getErrorCount() === 3);
        });

        it('should allow names inline', function() {
            assert(checker.checkString([
                '// jscs:allowNames asdf, jkl',
                'asdf = 1',
                'object.jkl = 1'
            ].join('\n')).isEmpty());
            assert(checker.checkString([
                '// jscs:allowNames asdf, jkl',
                'asdfAsdf = 1',
                'object.jklJkl = 1'
            ].join('\n')).getErrorCount() === 4);
        });

        it('should allow names as identifiers inline', function() {
            assert(checker.checkString([
                '// jscs:allowNamesAsIdentifiers asdf, jkl',
                'asdf = 1'
            ].join('\n')).isEmpty());
            assert(checker.checkString([
                '// jscs:allowNamesAsIdentifiers asdf, jkl',
                'asdfAsdf = 1',
                'object.jkl = 1',
                'object.jklJkl = 1'
            ].join('\n')).getErrorCount() === 5);
        });

        it('should allow names as properties inline', function() {
            assert(checker.checkString([
                '// jscs:allowNamesAsProperties asdf, jkl',
                'object.jkl = 1'
            ].join('\n')).isEmpty());
            assert(checker.checkString([
                '// jscs:allowNamesAsProperties asdf, jkl',
                'asdf = 1',
                'asdfAsdf = 1',
                'object.jklJkl = 1'
            ].join('\n')).getErrorCount() === 5);
        });
    });
});
