import Datastore from "./db/Datastore";
import FeedWithDetail from "./model/FeedWithDetail";
import TorrentData from "./model/TorrentData";
import Anilist from "./sources/Anilist";
import AnimeDetail from "./model/AnimeDetail";
import AbstractSource from "./sources/Abstract.source";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PromisePool = require("@supercharge/promise-pool");

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

  async getFeed(source: AbstractSource) {
    source.logger = this.logger;
    try {
      const feed = await source.getData();
      return this.getAnimeInfo(feed);
    } catch (e) {
      this.logger(e.message);
      throw e;
    }
  }

  private async getAnimeInfo(data: TorrentData[]): Promise<FeedWithDetail[]> {
    const output: FeedWithDetail[] = [];

    await PromisePool
      .withConcurrency(10)
      .for(data)
      .process(async (item: TorrentData) => {
        this.logger(`Checking local datastore for '${item.animeTitle}'`);
        // Check if the anime's details have already been saved
        let detail: AnimeDetail = await this.datastore.findAnimeDetail(
          item.animeTitle,
        );

        // If the anime details have not been previously saved
        if (detail == null) {
          detail = await Anilist.getDetail(item.animeTitle, this.logger);
          if (detail != null) {
            await this.datastore.saveAnimeDetail(detail);
          }
        }else{
          this.logger(`'${item.animeTitle}' found locally`);
        }

        // If searching fails
        // Happens if an anime it titled as 'S2' instead of the actual name
        if (detail == null) {
          const urlEncodedName = encodeURIComponent(item.animeTitle.slice(0, 10));
          detail = {
            title: item.animeTitle,
            description: null,
            imageColor: "#CCCCCC",
            imageUrl: `https://via.placeholder.com/460x651.png?text=${urlEncodedName}`,
            siteUrl: null,
          };
        }

        output.push({
          id: item.id,
          title: item.title,
          animeTitle: item.animeTitle,
          episode: item.episode,
          link: item.link,
          date: item.date,
          detail,
        });
      });

    return output;
  }

}
