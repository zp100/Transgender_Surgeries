# Transgender_Surgeries

Backup for the [r/Transgender_Surgeries](https://www.reddit.com/r/Transgender_Surgeries) wiki, created by [u/HiddenStill](https://www.reddit.com/user/HiddenStill). This backup was created by [u/ZachAttack6089](https://www.reddit.com/user/ZachAttack6089/) (message me on Reddit for any inquiries about this repository). I kept the main content intact as much as possible, but some links were broken (likely due to pages in the wiki being moved), so I changed those to point to the correct pages.

I'm not affiliated with any of the people or businesses discussed/linked in this wiki. I'm not intending to endorse or criticize any of them; including them in this GitHub project isn't an intent to give an opinion whatsoever. I'm just making a copy of what's on the wiki to preserve it in another location.

## Useful Links

- Main index: https://github.com/zp100/Transgender_Surgeries/blob/main/TransWiki/wiki/index/index.md
- Subreddit wiki's starting point: https://github.com/zp100/Transgender_Surgeries/blob/main/TransWiki/wiki/index/index.md
- Live backup: https://transgender-surgeries.vercel.app/
- Original wiki: https://old.reddit.com/r/TransSurgeriesWiki/wiki/index

## Link Organization

- External links that aren't backed up are marked with a ![Wikipedia external link icon](https://en.wikipedia.org/w/skins/Vector/resources/skins.vector.styles/images/link-external-small-ltr-progressive.svg?fb64d) icon.
- Links that are Reddit links on the original wiki, but stay within this GitHub repository for the backup, aren't marked.

## Download

To download your own copy of just the wiki contents:

1. Go to the "wiki.zip" file.
2. Click the "..." button in the top-right.
3. Under "Raw file content", click "Download".
4. Once it's downloaded, extract the ZIP folder.

Note that any wiki links in the downloaded copy will still link to this repository, not the pages you just downloaded.

The steps above will generate a download from this link: https://raw.githubusercontent.com/zp100/Transgender_Surgeries/refs/heads/main/wiki.zip

## Hosting

This backup is currently being hosted on a Vercel site: https://transgender-surgeries.vercel.app/

However, Vercel has the same drawback as hosting here on GitHub and on the original Reddit wiki, which is that a third-party host might take it down at any time without warning. So if you have some experience with backend web development (particularly Node), you can host a copy of the repository yourself:

1. Install [Node](https://nodejs.org/en) and [git](https://git-scm.com/) if you don't have them
2. Get a local copy of the repository: `git clone https://github.com/zp100/Transgender_Surgeries.git`, then `cd` into that folder
3. Install the project's dependencies: `npm install`
4. Start the Node server: `node api/index.js`

This should set up a local instance of the server, which you can access by going to http://localhost:3001/ in a browser. This isn't "self-hosting", though: Nobody besides your computer will be able to access it.

If you also have the capabilities to self-host the project, feel free to do so. I probably won't do it myself, but if the person reading this has the knowledge and resources to secure a domain and run the steps above on a (not local) deployment, it *should* work the same as a local server. You may need to mess with the port number, though. I had to add a lot of tweaks to get it to work regardless if it's run via `node api/index.js`, `vercel dev`, or production, and you'll likely run into similar issues.
