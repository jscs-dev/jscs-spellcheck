Maintainer Guide
================

Maintainers are the core developers of the project.
Their main role is to review, merge or reject pull-requests and fix critical bugs.
Some maintainers can have areas of responsibility:

 * @jacksonrayhamilton: general architecture, bug fixes, common rules.

Maintaining validation rules
----------------------------

Each rule should have:

 * Implementation in `lib/rules/rule-name.js`.
 * Documentation in `lib/rules/rule-name.js` (`JSDoc` comment should start at the beginning of the file).
 * Tests in `lib/test.rule-name.js`

Rule interface:

```javascript

    interface Rule {
        /**
         * Configures rule before being used in validations.
         *
         * @param {*} ruleConfigutationValue configuration value.
         * @returns {undefined}
         * @throws Error on invalid configuration value.
         */
        configure(ruleConfigutationValue);

        /**
         * Returns option name for this rule to be used in jscs config.
         *
         * @returns {String}
         */
         getOptionName();

        /**
         * Validates file.
         *
         * @param {JsFile} file - file representation. See lib/js-file.js.
         * @param {Errors} errors - object for validation errors to write to. See lib/errors.js.
         * @returns {undefined}
         */
        check(file, errors);
    }

```

Publishing a new version
---------------------------

1. Determine which part of the version you are about to increase. See our strategy in OVERVIEW.md.
1. Write changes to `CHANGELOG.md`: `npm run changelog`.
   Clean up the changelog by manually clarifying and reordering the messages. Ensure the changes are listed in following order:
   1. breaking changes.
   1. new rules or rule values.
   1. bug fixes.
   1. infrastructure changes.
   1. tests-only, docs changes, contributor minutia.
1. Commit the changelog update with the message: `Prepare for version x.x.x`.
1. Set a new version and tag: `npm version x.x.x`.
1. Push changes and tags: `git push && git push --tags`.
1. Use `npm run release` to publish the new version to npm. **DO NOT USE `npm publish`**, as this will not perform the necessary prepublish tasks. If you don't have publish privileges, ask @mdevils to publish for you.
1. Copy the changelog notes into the Github releases section located here: https://github.com/jscs-dev/jscs-spellcheck/releases
1. Tweet or otherwise promote the fact that a new version has been released with a link to the changelog and npm download page.
1. Done!
