# Git Commit Message

The reasons for these conventions:

- automatic generating of the changelog
- simple navigation through git history (eg. ignoring style changes)


## Format of the commit message:

    <type>(<scope>): <subject>
    
    <body>
    
    <footer>

### Allowed `<type>` values:

- `feat` (new feature)
- `fix` (bug fix)
- `docs` (changes to documentation)
- `style` (formatting, missing semi colons, etc; no code change)
- `refactor` (refactoring production code)
- `test` (adding missing tests, refactoring tests; no production code change)
- `chore` (updating grunt tasks etc; no production code change)

### Example `<scope>` values:

- `auth`
- `core`
- `sample`
- etc.

see http://karma-runner.github.io/0.10/dev/git-commit-msg.html
