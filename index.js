import fs from 'fs'
import path from 'path'

import through from 'through2'
import { transform } from 'babel-core'
import { PluginError, File, log, replaceExtension } from 'gulp-util'

module.exports = (opts) => {
    const messages = []
    const cwd = process.cwd()
    const options = opts || {}
    const name = 'gulp-react-intl-messages'
    const filename = options.filename || `${name}.json`

    /**
     * Buffers react-intl messages into an array. Should not emit 'readable' or
     * 'data' events until flushing the stream.
     *
     * @param  {Object}   file     Vinyl
     * @param  {String}   enc      Encoding
     * @param  {Function} callback Process current file
     */
    function bufferMessages (file, enc, callback) {
        const msg = (text) => {
            if (!options.silent) {
                log(`[${name}] ${text}`)
            }
        }
        const hasReactIntl = (plugin) => {
            return typeof plugin === 'string' && /react-intl$/.test(plugin)
        }
        const getBabelConfig = () => {
            const pkgPath = path.join(cwd, 'package.json')
            const brcPath = path.join(cwd, '.babelrc')

            try {
                const pkg = require(pkgPath)

                if (pkg.babel) {
                    msg(`Using babel options found at ${pkgPath}`)

                    return pkg.babel
                }
            } catch (error) { /* Ignore error */ }

            msg(`No babel options found at ${pkgPath}`)

            try {
                const babelrcFile = fs.readFileSync(brcPath)
                const babelrc = JSON.parse(babelrcFile)

                msg(`Using babel options found at ${brcPath}`)

                return babelrc
            } catch (error) {
                let errMsg = `Invalid JSON from ${brcPath}: ${error.message}`

                if (error.code === 'ENOENT') {
                    errMsg = `No babel options found at ${brcPath}`
                }

                msg(errMsg)
                msg('Using default of { plugins: ["react-intl"] }')

                return { plugins: ['react-intl'] }
            }
        }

        if (file.isNull()) {
            return callback()
        }

        if (file.isStream()) {
            return callback(new PluginError(name, 'Streaming not supported.'))
        }

        if (!options.babel) {
            msg('No options.babel passed')
            options.babel = getBabelConfig()
        }

        if (!options.babel.plugins) {
            options.babel.plugins = []
        }

        if (!Array.isArray(options.babel.plugins)) {
            return callback(new PluginError(name, 'options.babel.plugins must be an array: See https://babeljs.io/docs/usage/api/#options'))
        }

        if (!options.babel.plugins.some(hasReactIntl)) {
            options.babel.plugins.push('react-intl')
        }

        try {
            const trans = transform(file.contents.toString(), options.babel)
            const msgs = trans.metadata['react-intl'].messages

            if (msgs.length) {
                messages.push(...msgs)
            }
        } catch (error) {
            return callback(new PluginError(name, error))
        }

        callback()
    }

    function flush (callback) {
        if (messages.length) {
            this.push(new File({
                path: path.join(cwd, replaceExtension(filename, '.json')),
                contents: Buffer.from(JSON.stringify(messages, null, '\t'))
            }))
        }

        callback()
    }

    return through.obj(bufferMessages, flush)
}
