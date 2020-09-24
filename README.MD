# Atsumeru Core

![npm](https://img.shields.io/npm/v/atsumeru-core?style=flat-square)

Get 1080p anime feeds from [HorribeSubs](https://horriblesubs.info/).

## Usage

`yarn add atsumeru-core`

```Typescript
// const { AtsumeruCore } = require("atsumery-core")
import { AtsumeruCore } from "atsumeru-core";

// The second parameter, a logger, is optional
const atsumeruCore = new AtsumeruCore("./sampleDataDir", (s) => {
  console.log(s);
});

atsumeruCore
  .getFeedWithDetail()
  .then((res) => {
    res.forEach((r) => {
      console.log(`${r.animeTitle} - ${r.episode}`);
    });
  })
  .catch((e) => {
    console.log(e.message);
  });

```
