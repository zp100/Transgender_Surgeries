const express = require('express')
const { marked } = require('marked')
const { readFile, stat } = require('node:fs')
const { join } = require('path')

// App setup (configuring file access, port number, etc.).
const app = express()
app.set('views', './api/views')
app.set('view engine', 'pug')
app.use('/static', express.static(join(process.cwd(), 'api', 'static')))
const PORT = 3001
const WIKI_INDEX = 'TransWiki/wiki/index/index.md'

// Redirect the first site visit to the wiki index.
app.get('/', (_, res) => {
    res.redirect(`/wiki/${WIKI_INDEX}`)
    return
})

// Get wiki pages.
app.get('/wiki*', (req, res) => {
    // Check if the param is a valid file.
    const filePath = join(process.cwd(), 'wiki', req.params['0'])
    stat(filePath, (err, stats) => {
        if (err != null) {
            // Raise an error and tell the server what the attempted file was.
            console.error(`Failed to get file with path ${filePath}`)
            res.sendStatus(404)
            return
        } else if (!stats.isFile()) {
            // Raise an error and tell the server what the attempted file was.
            console.error(`Not a regular file at path ${filePath}`)
            res.sendStatus(400)
            return
        } else {
            // Read the file's markdown.
            readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    // Raise an error (this probably won't ever happen, but just in case).
                    console.error(err)
                    res.sendStatus(500)
                    return
                }

                // Convert the markdown to HTML.
                const markdownHtml = marked.parse(data, { gfm: true }).replaceAll(
                    // Replace all GitHub links to instead stay within whatever site is hosting this.
                    'https://github.com/zp100/Transgender_Surgeries/blob/main/',
                    (req.hostname === 'localhost'
                        ? `http://localhost:${PORT}/wiki/`
                        : `${req.protocol}://${req.hostname}/wiki/`
                    )
                )

                // Insert the HTML into the template and render it.
                res.render('wiki', {
                    markdownTitle: filePath.split('/').at(-1),
                    markdownHtml,
                    wikiIndex: WIKI_INDEX
                })
            })
        }
    })
})

// Logging.
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.`)
})

// Export for Vercel.
module.exports = app
