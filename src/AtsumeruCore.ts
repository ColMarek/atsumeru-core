import Datastore from "./db/Datastore";
import FeedWithDetail from "./model/FeedWithDetail";
import HSSource from "./sources/HSSource";
import TorrentData from "./model/TorrentData";
import Anilist from "./sources/Anilist";
import AnimeDetail from "./model/AnimeDetail";

export class AtsumeruCore {
  private datastore: Datastore;

  constructor(dataDir: string) {
    this.datastore = new Datastore(dataDir);
  }

  async getFeedWithDetail(): Promise<FeedWithDetail[]> {
    const feed = await HSSource.getData();
    return this.getAnimeInfo(feed);
  }

  private async getAnimeInfo(data: TorrentData[]): Promise<FeedWithDetail[]> {
    const promises = [];
    const alreadyFetched = [];
    const output: FeedWithDetail[] = [];

    for (let index = 0; index < data.length; index++) {
      const item = data[index];

      // Check if the anime's details have already been saved
      const storeDetail: any = await this.datastore.findAnimeDetail(
        item.animeTitle,
      );

      if (storeDetail == null) {
        // Avoid fetching details of the same anime twice.
        // Happens if the feed contains two eposides of the same anime
        if (!alreadyFetched.includes(item.animeTitle)) {
          // Add to an array of promises to allow fetching simultaneously
          promises.push(Anilist.getDetail(item.animeTitle));
          alreadyFetched.push(item.animeTitle);
        }
      } else {
        output[index] = {
          ...item,
          detail: storeDetail,
        };
      }
    }

    const details = await Promise.all(promises);
    details.forEach((d: AnimeDetail) => {
      this.datastore.saveAnimeDetail(d);
      const indexes = this.getAllIndexesOf(d.title, data);
      indexes.forEach((i) => {
        output[i] = {
          ...data[i],
          detail: d,
        };
      });
    });

    return output;
  }

  private getAllIndexesOf(title, data) {
    const indexes = [];
    for (let i = 0; i < data.length; i++)
      if (data[i].animeTitle === title) indexes.push(i);
    return indexes;
  }
}
