# Atsumeru Core

![npm](https://img.shields.io/npm/v/atsumeru-core?style=flat-square)

Get torrent feeds from [nyaa.si](https://nyaa.si/), [Erai-raws](https://www.erai-raws.info/) or a custom source.

Anime details are from [Anilist](https://anilist.co).

## Usage

`yarn add atsumeru-core`

```Typescript
// const { AtsumeruCore, NyaaSource, EraiSource } = require("atsumery-core")
import { AtsumeruCore, NyaaSource, EraiSource } from "atsumeru-core";

// The second parameter, a logger, is optional
const atsumeruCore = new AtsumeruCore("./sampleDataDir", (s) => {
  console.log(s);
});

// A custom rss feed url can be passed
const nyaa = new NyaaSource()

// A custom rss feed url can be passed
const erai = new EraiSource()

atsumeruCore.getFeed(nyaa)
  .then((res) => {
    res.forEach((r) => {
      console.log(`${r.animeTitle} - ${r.episode}`);
    });
  })
  .catch((e) => {
    console.log(e.message);
  });
```

## Custom source

Extend the [`AbstractSource`](./src/sources/Abstract.source.ts) class.

```Typescript
export default class CustomSource extends AbstractSource {
  constructor() {
    super("https://rss.example.com");
  }

  async getData(): Promise<TorrentData[] | null> {
    const response = await axios.get(this.url);
    const res: any = await xmlStringToJson(response.data);
    // Map res to TorrentData
  }
}
```