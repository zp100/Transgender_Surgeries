const express = require('express')
const { marked } = require('marked')
const { readFile, stat } = require('node:fs')
const { join } = require('path')

const app = express()
app.set('views', './api/views')
app.set('view engine', 'pug')
app.use('/static', express.static(join(process.cwd(), 'api', 'static')))
const PORT = 3001

app.get('/', (req, res) => {
    if (!('page' in req.query)) {
        res.redirect('/?page=TransWiki/wiki/index/index.md')
        return
    } else if (![ 'TransWiki', 'TransSurgeriesWiki' ].includes(req.query['page'].split('/')[0])) {
        console.error(`Invalid page ${req.query['page']}`)
        res.sendStatus(404)
        return
    }

    const filePath = join(process.cwd(), req.query['page'])
    stat(filePath, (err) => {
        if (err != null) {
            console.error(`Failed to find file with path ${filePath}`)
            res.sendStatus(404)
            return
        } else {
            readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(err)
                    res.sendStatus(500)
                    return
                }
        
                const markdownHtml = marked.parse(data, { gfm: true }).replaceAll(
                    'https://github.com/zp100/Transgender_Surgeries/blob/main/',
                    (req.hostname === 'localhost'
                        ? 'http://localhost:3000/?page='
                        : `${req.protocol}://${req.hostname}/?page=`
                    )
                )

                res.render('index', { markdownTitle: filePath.split('/').at(-1), markdownHtml })
            })
        }
    })
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.`)
})

module.exports = app
