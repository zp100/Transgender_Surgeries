const { readFile, stat } = require('node:fs')
const { join } = require('path')

// Fetch and process the page specified by a particular request.
// Generalized to apply to all pages in all sections (wiki, posts, etc.).
export function fileRequestCallback(
    req, res, wikiIndex, section, extension = 'html',
    dataCallback = (data) => ({ title: undefined, contentHtml: data })
) {
    // Check if the param is a valid file.
    const fileName = req.params['0']
    const filePath = join(process.cwd(), section, fileName)
    stat(filePath, (err, stats) => {
        if (err != null) {
            // Raise an error and tell the server what the attempted file was.
            console.error(`Failed to get file with path ${filePath}`)
            res.sendStatus(404)
        } else if (stats.isDirectory()) {
            // Go to the content file for this directory (if it exists).
            res.redirect(`/posts/${fileName}/content.${extension}`)
        } else if (!stats.isFile()) {
            // Raise an error and tell the server what the attempted file was.
            console.error(`Not a regular file at path ${filePath}`)
            res.sendStatus(400)
        } else {
            // Read the file's content.
            readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    // Raise an error (this probably won't ever happen, but just in case).
                    console.error(err)
                    res.sendStatus(500)
                    return
                }

                // Run callback for this file.
                const { title, contentHtml } = dataCallback(data)

                // Get the route for the original Reddit page (without the "content" part).
                let routeParts = fileName.split('/')
                routeParts.splice(-1, 1, '')
                const remoteRoute = routeParts.join('/')

                // Insert the HTML into the template and render it.
                res.render('posts', {
                    title,
                    contentHtml,
                    wikiIndex,
                    remoteRoute
                })
            })
        }
    })
}
