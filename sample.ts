import { AtsumeruCore } from "./src";
import NyaaSource from "./src/sources/Nyaa.source";
import EraiSource from "./src/sources/Erai.source";
import SubsPleaseSource from "./src/sources/SubsPlease.source";

// The second parameter, a logger, is optional
const atsumeruCore = new AtsumeruCore("./sampleDataDir", (s) => {
  console.log(s);
});


// A custom rss feed url can be passed
const nyaa = new NyaaSource()

// A custom rss feed url can be passed
const erai = new EraiSource()

const generic = new SubsPleaseSource("https://subsplease.org/rss/?r=1080")

atsumeruCore.getFeed(generic)
  .then((res) => {
    res.forEach((r) => {
      console.log(`${r.animeTitle} - ${r.episode}`);
    });
  })
  .catch((e) => {
    console.log(e.message);
  });
