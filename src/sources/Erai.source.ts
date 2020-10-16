import axios from "axios";
import * as dayjs from "dayjs";
import TorrentData from "../model/TorrentData";
import { xmlStringToJson } from "../util/xmlToJson";

export default class EraiSource {
  static async getData(
    logger: (s: string) => void,
  ): Promise<TorrentData[] | null> {
    logger("Fetching torrents from Erai-Raws");

    try {
      const response = await axios.get("https://www.erai-raws.info/rss-1080-magnet");
      const res: any = await xmlStringToJson(response.data);
      logger(
        `Retrieved ${res.rss.channel[0].item.length} items from Erai-Raws`,
      );

      const data: TorrentData[] = [];
      for (const item of res.rss.channel[0].item) {
        const animeTitle: string = item.title[0]
          .replace("[1080p] ", "")
          .replace(/r \(TV\)/gm, "r") // Specifically for Black Clover (TV)
          .split(" – ")[0] // That is not a hypen, it's an en dash
          .replace(/ +/gm, " ") // Remove double spaces
          .trim();
        const episode: string = item.title[0].split(` – `)[1].split(" ")[0];
        const plainTitle = animeTitle.replace(/ |-|\(|\)|:/g, "");
        const id = `${plainTitle.toLowerCase()}_${episode}`;
        data.push({
          id,
          title: item.title[0],
          animeTitle,
          episode,
          link: item.link[0],
          date: dayjs(item.pubDate[0]).unix(),
        });
      }

      return data;
    } catch (error) {
      logger(error);
      return null;
    }
  }
}
