import axios from "axios";
import * as dayjs from "dayjs";
import TorrentData from "../model/TorrentData";
import { xmlStringToJson } from "../util/xmlToJson";
import AbstractSource from "./Abstract.source";

export default class EraiSource extends AbstractSource {
  constructor(url = "https://www.erai-raws.info/rss-1080magnet") {
    super(url);
  }

  async getData(): Promise<TorrentData[] | null> {
    this.logger("Fetching torrents from Erai-Raws");

    try {
      const response = await axios.get(this.url);
      const res: any = await xmlStringToJson(response.data);
      this.logger(
        `Retrieved ${res.rss.channel[0].item.length} items from Erai-Raws`,
      );

      const data: TorrentData[] = [];
      for (const item of res.rss.channel[0].item) {
        const animeTitle: string = item.title[0]
          .replace(/(\[)([^\[\]]*)(\])/gm, "") // [*]
          .replace(/r \(TV\)/gm, "r") // Specifically for Black Clover (TV)
          .split(" – ") // That is not a hypen, it's an en dash
          .slice(0, -1)
          .join(" ")
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
      if (error.response) {
        if (error.response.headers.server === "ddos-guard") {
          throw new Error("Erai-raws feed blocked by DDoS-GUARD");
        } else if (error.response.headers.server === "cloudflare") {
          throw new Error(`Cloudflare error: ${error.response.statusText}`);
        }
        throw new Error(error.response.data);
      }
      throw error;
    }
  }
}
