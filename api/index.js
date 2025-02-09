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
const WIKI_INDEX = 'TransWiki/wiki/index/content.md'

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

                // Replace all GitHub links to instead stay within whatever site is hosting this.
                const relativeData = data.replaceAll(
                    /\[(.*?)\]\((https:\/\/github\.com\/zp100\/Transgender_Surgeries\/blob\/main\/wiki\/)(.*?)\)/g,
                    '<span class="internal">[$1](/wiki/$3)</span>'
                )

                // Convert the markdown to HTML.
                const markdownHtml = marked.parse(relativeData, { gfm: true })

                // Insert the HTML into the template and render it.
                res.render('wiki', {
                    title: filePath.split('/').at(-2),
                    wikiIndex: WIKI_INDEX,
                    markdownHtml
                })
            })
        }
    })
})

// Get posts and comments.
app.get('/posts*', (req, res) => {
    // Check if the param is a valid file.
    const filePath = join(process.cwd(), 'posts', req.params['0'])
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
            // Read the file's HTML.
            readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    // Raise an error (this probably won't ever happen, but just in case).
                    console.error(err)
                    res.sendStatus(500)
                    return
                }

                // Insert the HTML into the template and render it.
                res.render('posts', {
                    title: filePath.split('/').at(-2),
                    wikiIndex: WIKI_INDEX,
                    postHtml: data
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
