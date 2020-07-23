import axios from "axios";
import AnimeDetail from "../model/AnimeDetail";

export default class Anilist {
  static async getDetail(
    title: string,
    logger: (s: string) => void,
  ): Promise<AnimeDetail | null> {
    logger(`Searching AniList for '${title}'`);
    try {
      const query = `
    {
      Media(search: "${title}", type: ANIME) {
        siteUrl
        description
        coverImage {
          large
          color
        }
      }
    }
    `;

      const res = await axios({
        method: "POST",
        url: "https://graphql.anilist.co/",
        data: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      return {
        title,
        siteUrl: res.data.data.Media.siteUrl,
        description: res.data.data.Media.description,
        imageUrl: res.data.data.Media.coverImage.large,
        imageColor: res.data.data.Media.coverImage.color,
      };
    } catch (error) {
      logger(`Searching for '${title}' failed with '${error.message}'`);
      return null;
    }
  }
}
