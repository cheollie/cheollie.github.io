# Published duck scenes

These files come from the two public Spline embeds already used on this website.
They do not come from the private portfolio API.

Refresh after publishing edits in Spline:

```sh
node tools/sync-spline-scenes.mjs
```

The HTML keeps the original embed styling and interactions, with the Spline badge hidden.
The binary separates the inline scene data so the browser can preload it.
After the runtime starts and two animation frames run, the embed tells the parent
page to reveal the live canvas. Until then, the page displays three ducks taking turns jumping below the loading message.
The sync script also refreshes page URLs, runtime preload hints, and the prefetch manifest.
Scene URLs include a content hash so updated exports bypass stale browser caches.
Publish the refreshed site files after syncing; edits in Spline alone do not update these local copies.
