import axios from "axios";
import TorrentData from "../model/TorrentData";
import { xmlStringToJson } from "../util/xmlToJson";

export default class NyaaSource {
  static async getData(
    logger: (s: string) => void,
  ): Promise<TorrentData[] | null> {
    try {
      logger("Fetching torrents from nyaa.si");

      const response = await axios.get(
        "https://nyaa.si/?page=rss&q=1080p&c=1_2&f=0",
      );
      const res: any = await xmlStringToJson(response.data);
      logger(`Retrieved ${res.rss.channel[0].item.length} items from nyaa.si`);

      const data: TorrentData[] = [];
      for (const item of res.rss.channel[0].item) {
        let animeTitle = item["title"][0]
          .replace(/(\[)([^\[\]]*)(\])/gm, "") // [*]
          .replace(/(\()([^\(\)]*)(\))/gm, "") // (*)
          .trim()
          .replace(
            /Bluray|x26\d|DualAudio|FLAC|AntiOrdinary|WEBRip|END|V2|HR-SR|-Rapta|1080p|720p|AKA/gm,
            "",
          ) // Random things
          .replace(/\d+-\d+/gm, "") // 00-00
          .replace(/ - /gm, " ") // ' - '
          .replace(/ -$/gm, " ") // ' -' Doesn't work when combined with above
          .replace(/ \d+ /gm, " ") // 00
          .replace(/ \d+/gm, " ") // 00
          .replace(/S\d+/gm, " ") // S1, S01
          .replace(/[Ss]eason \d+/gm, " ") // Season 00
          .replace(/[Ee]pisode|E\d+/gm, " ") // Episode, E00
          .replace(/\.mkv|\.mp4/gm, "") // .mkv, .mp4
          .trim();

        if (animeTitle == "") {
          animeTitle = item["title"][0];
        }

        const torrentData = new TorrentData();
        torrentData.id = item["nyaa:infoHash"][0];
        torrentData.title = item["title"][0];
        torrentData.animeTitle = animeTitle;
        torrentData.episode = "0";
        torrentData.link = item["link"][0];
        torrentData.date = item["pubDate"][0];
        data.push(torrentData);
      }

      return data;
    } catch (error) {
      logger(error.message);
      return null;
    }
  }
}
