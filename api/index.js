const express = require('express')
const favicon = require('serve-favicon')
const { marked } = require('marked')
const { join } = require('path')
const { fileRequestCallback } = require('./util')

// App setup (configuring file access, port number, etc.).
const app = express()
app.set('views', './api/views')
app.set('view engine', 'pug')
app.use('/static', express.static(join(process.cwd(), 'api', 'static')))
app.use(favicon(join(process.cwd(), 'api', 'static', 'favicon.png')))
const PORT = 3001
const WIKI_INDEX = 'r/TransWiki/wiki/index/content.md'

// Redirect the first site visit to the wiki index.
app.get('/', (_, res) => {
    res.redirect(`/wiki/${WIKI_INDEX}`)
})

// Get wiki pages.
app.get('/wiki*', (req, res) => {
    function markdownCallback(data) {
        // Get the page's title.
        const title = data.match(/^(?<!\n)\*\*(.+?)\*\*/)?.[1]

        // Replace all GitHub links to instead stay within whatever site is hosting this.
        const relativeData = data.replaceAll(
            /\[(.*?)\]\((https:\/\/github\.com\/zp100\/Transgender_Surgeries\/blob\/main\/)(.*?)\)/g,
            '<span class="internal">[$1](/$3)</span>'
        )

        // Convert the markdown to HTML.
        const contentHtml = marked.parse(relativeData, { gfm: true })

        // Return.
        return { title, contentHtml }
    }

    fileRequestCallback(req, res, WIKI_INDEX, 'wiki', 'md', markdownCallback)
})

// Get posts and comments.
app.get('/posts*', (req, res) => {
    function htmlCallback(data) {
        // Get the page's title.
        const title = data.match(/(.*)\n<\/h2>/)?.[1]

        // Copy data to avoid pass-by-reference errors.
        const contentHtml = data

        // Return.
        return { title, contentHtml }
    }

    fileRequestCallback(req, res, WIKI_INDEX, 'posts', 'html', htmlCallback)
})

// Logging.
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.`)
})

// Export for Vercel.
module.exports = app
