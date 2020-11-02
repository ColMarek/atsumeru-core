import { AtsumeruCore } from "./src";
import NyaaSource from "./src/sources/Nyaa.source";
import EraiSource from "./src/sources/Erai.source";

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
