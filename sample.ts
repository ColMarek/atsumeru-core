import { AtsumeruCore } from "./src";
import NyaaSource from "./src/sources/Nyaa.source";
import EraiSource from "./src/sources/Erai.source";
import SubsPleaseSource from "./src/sources/SubsPlease.source";

// The second parameter, a logger, is optional
const atsumeruCore = new AtsumeruCore("./sampleDataDir", (s) => {
  console.log(s);
});

// A custom rss feed url can be passed
// new NyaaSource();
// new EraiSource();

const subsPlease = new SubsPleaseSource();

atsumeruCore
  .getFeed(subsPlease)
  .then((res) => {
    res.forEach((r) => {
      console.log(`${r.animeTitle} - ${r.episode}`);
    });
  })
  .catch((e) => {
    console.log(e.message);
  });
