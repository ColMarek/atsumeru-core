import AbstractSource from "./Abstract.source";
import TorrentData from "../model/TorrentData";
import axios from "axios";
import { xmlStringToJson } from "../util/xmlToJson";
import * as dayjs from "dayjs";

export default class SubsPleaseSource extends AbstractSource {
  private incorrectNames = {
    "Yuru Camp S2": "Yuru Camp△ SEASON 2",
  };

  constructor(url = "https://subsplease.org/rss/?r=1080") {
    super(url);
  }

  async getData(): Promise<TorrentData[] | null> {
    this.logger("Fetching torrents from SubsPlease");

    const response = await axios.get(this.url);
    const res: any = await xmlStringToJson(response.data);
    this.logger(
      `Retrieved ${res.rss.channel[0].item.length} items from SubsPlease`,
    );

    const data: TorrentData[] = [];
    for (const item of res.rss.channel[0].item) {
      let animeTitle: string = item.title[0]
        .replace(/(\[)([^\[\]]*)(])/gm, "") // [*]
        .replace(/(\()([^()]*)(\))/gm, "") // [*]
        .split(" - ")
        .slice(0, -1)
        .join(" ")
        .replace(/ +/gm, " ") // Remove double spaces
        .replace(".mkv", "")
        .trim();
      let episode = null;
      if (item.title[0].includes("Batch")) {
        episode = item.title[0]
          .match(/\([^ ]*-[^ ]*\)/gm)[0]
          .replace(/[()]/g, "");
      } else {
        const epNum = item.title[0].match(/ \d*[v]?\d /gm);
        if (epNum) {
          episode = epNum[0].trim();
          episode = episode.replace(/v\d*/gm, "")
        }
      }
      const plainTitle = animeTitle.replace(/[ \-():]/g, "");
      const id = `${plainTitle.toLowerCase()}_${episode}`;
      if (this.incorrectNames[animeTitle]) {
        this.logger(`Replacing '${animeTitle}' with '${this.incorrectNames[animeTitle]}'`);
        animeTitle = this.incorrectNames[animeTitle];
      }
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
  }
}
