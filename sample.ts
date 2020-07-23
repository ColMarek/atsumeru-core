import { AtsumeruCore } from "./src";

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
