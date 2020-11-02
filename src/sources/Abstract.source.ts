import TorrentData from "../model/TorrentData";

export default abstract class AbstractSource {
  url: string;
  logger: (s: string) => void;

  constructor(url: string) {
    this.url = url;
  }

  abstract async getData(): Promise<TorrentData[] | null>
}

