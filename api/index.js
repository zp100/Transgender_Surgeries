const express = require('express')
const { marked } = require('marked')
const { gfmHeadingId } = require('marked-gfm-heading-id')
const { join } = require('path')
const favicon = require('serve-favicon')
const { fileRequestCallback, getTree, replaceLinks } = require('./util')

// App setup (configuring file access, port number, etc.).
const app = express()
app.set('views', './api/views')
app.set('view engine', 'pug')
app.use('/static', express.static(join(process.cwd(), 'api', 'static')))
app.use(favicon(join(process.cwd(), 'api', 'static', 'favicon.png')))
marked.use(gfmHeadingId())
const PORT = 3001

// Load the root index.
app.get('/', (req, res) => {
    const title = 'Root Index'
    const isCustomRedirect = ('custom-redirect' in req.query)
    const wikiTree = getTree('wiki')
    const postsTree = getTree('posts')

    res.render('root-index', { title, isCustomRedirect, wikiTree, postsTree })
})

// Get wiki pages.
app.get('/wiki*', (req, res) => {
    function markdownCallback(data) {
        // Get the page's title.
        const title = data.match(/^(?<!\n)\*\*(.+?)\*\*/)?.[1]

        const isCustomRedirect = ('custom-redirect' in req.query)
        const rawHtml = marked(data, { gfm: true })
        const contentHtml = replaceLinks(rawHtml, isCustomRedirect)
        return { title, contentHtml, isCustomRedirect }
    }

    fileRequestCallback(req, res, 'wiki', 'md', markdownCallback)
})

// Get posts and comments.
app.get('/posts*', (req, res) => {
    function htmlCallback(data) {
        // Get the page's title.
        const title = data.match(/(.*)\n<\/h2>/)?.[1]

        const isCustomRedirect = ('custom-redirect' in req.query)
        const contentHtml = replaceLinks(data, isCustomRedirect)
        return { title, contentHtml, isCustomRedirect }
    }

    fileRequestCallback(req, res, 'posts', 'html', htmlCallback)
})

// Intercept external links to check if there's an archive of them first.
app.get('/redirect', async (req, res) => {
    if (!('url' in req.query) || req.query['url'] === '' ) {
        // Raise an error and tell the server what the attempted request was.
        console.error(`Invalid redirect request query ${req.query}`)
        res.sendStatus(400)
        return
    }

    // Redirect to archive.
    // If an error occurs, fall back to the main site.
    const newUrl = req.query['url']
    const archiveUrl = `https://web.archive.org/web/${newUrl}`
    const archiveResponse = await fetch(archiveUrl)
    res.redirect(archiveResponse.ok ? archiveUrl : newUrl)
})

// Export for Vercel.
module.exports = app
