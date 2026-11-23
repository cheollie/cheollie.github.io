// Refresh only the two publicly published Spline embeds (never portfolio-api data).
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const scenes = {
  home: 'https://my.spline.design/molang3dcopy-6388b49305715f4102a92675ed558214/',
  blog: 'https://my.spline.design/untitled-503644d4f46411fed859a224cdb4b3bc/?v=2'
};
await mkdir(new URL('../scenes/', import.meta.url), { recursive: true });
const manifest = {};
for (const [name, url] of Object.entries(scenes)) {
  const response = await fetch(url, {cache: 'no-store'});
  if (!response.ok) throw new Error(`Spline export: ${response.status}`);
  let html = await response.text();
  const data = html.match(/app\.start\((\[[\d,\s]+\])\)\.then\(onLoad\);/);
  if (!data) throw new Error(`Unexpected Spline export format: ${name}`);
  const bytes = Uint8Array.from(JSON.parse(data[1]));
  const revision = createHash('sha256').update(bytes).digest('hex').slice(0, 12);
  html = html.replace(data[0], `
    const response = await fetch('./${name}.bin?v=${revision}');
    if (!response.ok) throw new Error('Scene download failed');
    await app.start(Array.from(new Uint8Array(await response.arrayBuffer())));
    onLoad();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.documentElement.dataset.sceneReady = 'true';
      parent.postMessage({ type: 'duck-scene-ready' }, location.origin);
    }));`);
  // Start downloading the data while the runtime module is being fetched.
  html = html.replace('</head>', `<link rel="preload" href="./${name}.bin?v=${revision}" as="fetch" crossorigin><style>.spline-watermark{display:none!important}</style></head>`);
  await writeFile(new URL(`../scenes/${name}.bin`, import.meta.url), bytes);
  html = html.split('\n').map(line => line.trimEnd()).join('\n');
  await writeFile(new URL(`../scenes/${name}.html`, import.meta.url), html);
  // Change URLs with the scene so repeat visitors cannot reuse stale scene bytes.
  const pageUrl = new URL(name === 'home' ? '../index.html' : '../blog.html', import.meta.url);
  let page = await readFile(pageUrl, 'utf8');
  page = page.replace(new RegExp(`/scenes/${name}\\.html(?:\\?v=[a-z0-9]+)?`, 'g'), `/scenes/${name}.html?v=${revision}`);
  page = page.replace(new RegExp(`/scenes/${name}\\.bin(?:\\?v=[a-z0-9]+)?`, 'g'), `/scenes/${name}.bin?v=${revision}`);
  const runtime = html.match(/https:\/\/cdn\.spline\.design\/@splinetool\/runtime@[^'"\s]+\/runtime\.js/);
  if (runtime) page = page.replace(/https:\/\/cdn\.spline\.design\/@splinetool\/runtime@[^'"\s]+\/runtime\.js/g, runtime[0]);
  await writeFile(pageUrl, page);
  manifest[name] = { revision, runtime: runtime?.[0] };
  console.log(`${name}: ${bytes.length} bytes; refreshed scene with hidden badge`);
}

await writeFile(new URL('../scenes/manifest.json', import.meta.url), JSON.stringify(manifest, null, 2) + '\n');
