const express = require('express')
const { marked } = require('marked')
const { join } = require('path')
const { fileRequestCallback } = require('./util')

// App setup (configuring file access, port number, etc.).
const app = express()
app.set('views', './api/views')
app.set('view engine', 'pug')
app.use('/static', express.static(join(process.cwd(), 'api', 'static')))
const PORT = 3001
const WIKI_INDEX = 'r/TransWiki/wiki/index/content.md'

// Redirect the first site visit to the wiki index.
app.get('/', (_, res) => {
    res.redirect(`/wiki/${WIKI_INDEX}`)
})

// Get wiki pages.
app.get('/wiki*', (req, res) => {
    function markdownCallback(data) {
        // Replace all GitHub links to instead stay within whatever site is hosting this.
        const relativeData = data.replaceAll(
            /\[(.*?)\]\((https:\/\/github\.com\/zp100\/Transgender_Surgeries\/blob\/main\/wiki\/)(.*?)\)/g,
            '<span class="internal">[$1](/wiki/$3)</span>'
        )

        // Convert the markdown to HTML.
        const markdownHtml = marked.parse(relativeData, { gfm: true })
        return markdownHtml
    }

    fileRequestCallback(req, res, WIKI_INDEX, 'wiki', 'md', markdownCallback)
})

// Get posts and comments.
app.get('/posts*', (req, res) => fileRequestCallback(req, res, WIKI_INDEX, 'posts'))

// Logging.
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.`)
})

// Export for Vercel.
module.exports = app
