const directoryTree = require('directory-tree')
const { readFile, stat } = require('node:fs')
const { join } = require('path')

// Fetch and process the page specified by a particular request.
// Generalized to apply to all pages in all sections (wiki, posts, etc.).
function fileRequestCallback(
    req, res, section, extension = 'html',
    dataCallback = (data) => ({ title: undefined, contentHtml: data, isCustomRedirect: false })
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
            res.redirect(`/${section}/${fileName}/content.${extension}`)
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
                const { title, contentHtml, isCustomRedirect } = dataCallback(data)

                // Get the route for the original Reddit page (without the "content" part).
                let routeParts = fileName.split('/')
                routeParts.splice(-1, 1, '')
                const remoteRoute = routeParts.join('/')

                // Insert the HTML into the template and render it.
                res.render(section, { title, contentHtml, isCustomRedirect, remoteRoute })
            })
        }
    })
}

// Update links where needed.
function replaceLinks(data, isCustomRedirect=false) {
    if (isCustomRedirect) {
        // Replace all GitHub links to instead stay within whatever site is hosting this.
        data = data.replaceAll(
            /<a href="https:\/\/github.com\/zp100\/Transgender_Surgeries\/blob\/main\/([^"]+)"/g,
            '<a class="internal" href="/$1?custom-redirect"'
        )

        // Replace all other links to use redirect interceptor.
        data = data.replaceAll(
            /<a href="([^\/][^"]+)"/g,
            '<a href="/redirect?url=$1"'
        )
    } else {
        // Replace all GitHub links to instead stay within whatever site is hosting this.
        data = data.replaceAll(
            /<a href="https:\/\/github.com\/zp100\/Transgender_Surgeries\/blob\/main\/([^"]+)"/g,
            '<a class="internal" href="/$1"'
        )
    }

    return data
}

// Get the file tree for the given directory (defaults to project root).
function getTree(path='') {
    function customize(item) {
        const fileItem = item.children.find((childItem) => childItem.type === 'file');
        const folderItem = item.children.find((childItem) => childItem.type === 'directory');

        item.name += '/'
        item.flags = {
            isParent: (folderItem !== undefined),
            isStarred: false,
            isLink: (fileItem !== undefined)
        }
        if (item.flags.isLink) {
            item.url = fileItem.path.replace(process.cwd(), '')
        }

        return item
    }

    const treePath = join(process.cwd(), path)
    const attributes = [ 'type' ]
    return directoryTree(treePath, { attributes }, undefined, customize)
}

module.exports = { fileRequestCallback, getTree, replaceLinks }
