const express = require('express')
const favicon = require('serve-favicon')
const { marked } = require('marked')
const { gfmHeadingId } = require('marked-gfm-heading-id')
const { join } = require('path')
const { fileRequestCallback, makeRelative } = require('./util')

// App setup (configuring file access, port number, etc.).
const app = express()
app.set('views', './api/views')
app.set('view engine', 'pug')
app.use('/static', express.static(join(process.cwd(), 'api', 'static')))
app.use(favicon(join(process.cwd(), 'api', 'static', 'favicon.png')))
marked.use(gfmHeadingId())
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

        const rawHtml = marked(data, { gfm: true })
        const contentHtml = makeRelative(rawHtml)
        return { title, contentHtml }
    }

    fileRequestCallback(req, res, WIKI_INDEX, 'wiki', 'md', markdownCallback)
})

// Get posts and comments.
app.get('/posts*', (req, res) => {
    function htmlCallback(data) {
        // Get the page's title.
        const title = data.match(/(.*)\n<\/h2>/)?.[1]

        const contentHtml = makeRelative(data)

        console.log(data, contentHtml)

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
