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

app.get('/', (_, res) => {
    res.redirect(`/wiki?page=${WIKI_INDEX}`)
    return
})

app.get('/wiki', (req, res) => {
    if (!(
        'page' in req.query &&
        [ 'TransWiki', 'TransSurgeriesWiki' ].includes(req.query['page'].split('/')[0])
    )) {
        // If the "page" param is missing or specifies a file that doesn't exist in the wiki, raise an error.
        console.error(`Invalid page ${req.query['page']}`)
        res.sendStatus(404)
        return
    }

    // Check if the "page" param is a valid file.
    const filePath = join(process.cwd(), 'wiki', req.query['page'])
    stat(filePath, (err) => {
        if (err != null) {
            // Raise an error and tell the server what the attempted file was.
            console.error(`Failed to find file with path ${filePath}`)
            res.sendStatus(404)
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
                        ? `http://localhost:${PORT}/wiki?page=`
                        : `${req.protocol}://${req.hostname}/wiki?page=`
                    )
                )

                // Insert the HTML into the template and render it.
                res.render('index', {
                    markdownTitle: filePath.split('/').at(-1),
                    markdownHtml,
                    wikiIndex: WIKI_INDEX
                })
            })
        }
    })
})

// Loggin.
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.`)
})

// Export for Vercel. (This might not be needed? Doesn't hurt anything, though.)
module.exports = app
