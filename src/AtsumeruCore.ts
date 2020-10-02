import Datastore from "./db/Datastore";
import FeedWithDetail from "./model/FeedWithDetail";
import TorrentData from "./model/TorrentData";
import Anilist from "./sources/Anilist";
import AnimeDetail from "./model/AnimeDetail";
import NyaaSource from "./sources/Nyaa.source";

export class AtsumeruCore {
  private datastore: Datastore;
  private logger: (s: string) => void;

  constructor(dataDir: string, logger?: (s: string) => void) {
    this.datastore = new Datastore(dataDir);
    if (!logger) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      this.logger = () => {};
    } else {
      this.logger = logger;
    }
  }

  async getFeedWithDetail(): Promise<FeedWithDetail[]> {
    const feed = await NyaaSource.getData(this.logger);
    if (feed == null) {
      throw new Error("Unable to feed from nyaa.si");
    }
    return this.getAnimeInfo(feed);
  }

  private async getAnimeInfo(data: TorrentData[]): Promise<FeedWithDetail[]> {
    const promises = [];
    const alreadyFetched = [];
    const output: FeedWithDetail[] = [];

    for (let index = 0; index < data.length; index++) {
      const item = data[index];

      this.logger(`Checking local datastore for '${item.animeTitle}'`);
      // Check if the anime's details have already been saved
      const storeDetail: any = await this.datastore.findAnimeDetail(
        item.animeTitle,
      );

      if (storeDetail == null) {
        // Avoid fetching details of the same anime twice.
        // Happens if the feed contains two eposides of the same anime
        if (!alreadyFetched.includes(item.animeTitle)) {
          // Add to an array of promises to allow fetching simultaneously
          promises.push(Anilist.getDetail(item.animeTitle, this.logger));
          alreadyFetched.push(item.animeTitle);
        } else {
          this.logger(`Already searched for '${item.animeTitle}' in this run`);
        }
      } else {
        this.logger(`'${item.animeTitle}' found locally`);
        output[index] = {
          ...item,
          detail: storeDetail,
        };
      }
    }

    const details = await Promise.all(promises);
    details.forEach((d: AnimeDetail) => {
      if (d != null) {
        this.datastore.saveAnimeDetail(d);
        const indexes = this.getAllIndexesOf(d.title, data);
        indexes.forEach((i) => {
          output[i] = {
            ...data[i],
            detail: d,
          };
        });
      }
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
