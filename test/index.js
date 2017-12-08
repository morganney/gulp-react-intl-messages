import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { File, noop, buffer } from 'gulp-util'
import reactIntlMessages from '../'

const options = { babel: { plugins: ['react-intl'] } }
const msg1 = fs.readFileSync(path.join(__dirname, 'fixtures/message-1.js'))
const msg2 = fs.readFileSync(path.join(__dirname, 'fixtures/message-2.js'))
const noMsg = fs.readFileSync(path.join(__dirname, 'fixtures/no-message.js'))

describe('gulp-react-intl-messages', () => {
    it('should support defaults for "filename" and "babel"', (done) => {
        const useDefaults = () => {
            const stream = reactIntlMessages({ silent: true })

            stream.on('data', (file) => {
                const contents = JSON.parse(file.contents.toString())
                assert.equal(contents[0].id, 'message1')
            })
            stream.write(new File({
                path: path.join(__dirname, 'fixtures/message-1.js'),
                contents: msg1
            }))
            stream.on('end', done)
            stream.end()
        }

        assert.doesNotThrow(useDefaults)
    })
    it('should emit error on streamed file', (done) => {
        const stream = reactIntlMessages(options)

        stream.once('error', (error) => {
            assert.equal(error.message, 'Streaming not supported.')
            done()
        })
        stream.write(new File({
            path: path.join(__dirname, 'fixtures/no-streaming.js'),
            contents: noop()
        }))
    })
    it('should ignore null files', (done) => {
        const stream = reactIntlMessages(options)

        stream.pipe(buffer((error, files) => {
            assert.equal(files.length, 0)
            done()
        }))
        stream.write(new File())
        stream.end()
    })
    it('should return nothing if no messages were found', (done) => {
        const stream = reactIntlMessages(options)

        stream.pipe(buffer((error, files) => {
            assert.equal(files.length, 0)
            done()
        }))
        stream.write(new File({
            path: path.join(__dirname, 'fixtures/no-message.js'),
            contents: noMsg
        }))
        stream.end()
    })
    it('should combine react-intl messages from multiple files into one', (done) => {
        const stream = reactIntlMessages(options)

        stream.pipe(buffer((error, files) => {
            const contents = JSON.parse(files[0].contents.toString())

            assert.equal(files.length, 1)
            assert.equal(contents[0].id, 'message1')
            assert.equal(contents[1].id, 'message2')
        }))
        stream.write(new File({
            path: path.join(__dirname, 'fixtures/message-1.js'),
            contents: msg1
        }))
        stream.write(new File({
            path: path.join(__dirname, 'fixtures/message-2.js'),
            contents: msg2
        }))
        stream.on('end', done)
        stream.end()
    })
})
