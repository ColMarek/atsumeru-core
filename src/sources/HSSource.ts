import axios from "axios";
import * as moment from "moment";
import TorrentData from "../model/TorrentData";
import { xmlStringToJson } from "../util/xmlToJson";

export default class HSSource {
  static async getData(
    logger: (s: string) => void,
  ): Promise<TorrentData[] | null> {
    logger("Fetching torrents form HorribleSubs");

    try {
      const response = await axios.get(
        "http://www.horriblesubs.info/rss.php?res=1080",
      );
      const res: any = await xmlStringToJson(response.data);
      logger(
        `Retrieved ${res.rss.channel[0].item.length} items from HorribleSubs`,
      );

      const data: TorrentData[] = [];
      for (const item of res.rss.channel[0].item) {
        const animeTitle: string = item.title[0]
          .replace("[HorribleSubs] ", "")
          .replace(" [1080p].mkv", "")
          .replace(/ - \d.*/g, "")
          .trim();
        const episode: string = item.title[0]
          .split(`${animeTitle} - `)[1]
          .split("[1080p]")[0]
          .trim();
        const plainTitle = animeTitle.replace(/ |-|\(|\)/g, "");
        const id = `${plainTitle.toLowerCase()}_${episode}`;

        data.push({
          id,
          title: item.title[0],
          animeTitle,
          episode,
          link: item.link[0],
          date: moment(item.pubDate[0]).unix(),
        });
      }

      return data;
    } catch (error) {
      logger(error.message);
      return null;
    }
  }
}
