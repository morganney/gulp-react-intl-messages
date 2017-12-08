# gulp-react-intl-messages

> Extract React Intl default messages into one file with [babel-plugin-react-intl](https://github.com/yahoo/babel-plugin-react-intl)

## Install

```
npm install --save-dev gulp-react-intl-messages
yarn add --dev gulp-react-intl-messages
```

## Usage

```js
const gulp = require('gulp')
const reactIntlMessages = require('gulp-react-intl-messages')

gulp.src('/path/to/messages/**/*.js').pipe(reactIntlMessages({
    filename: 'all-react-intl-default-messages.json',
    // whatever babel options your src'd files need
    babel: { plugins: ['react-intl'] }
}).pipe(gulp.dest('dist'))
```

## API

### reactIntlMessages([options])

#### options

`filename` Name of resulting file (extension will be coerced to .json). Defaults to "gulp-react-intl-messages.json".

`babel` See the [Babel options](https://babeljs.io/docs/usage/options/). Defaults to `{ plugins: ['react-intl'] }`.

## License

[MIT](license)
