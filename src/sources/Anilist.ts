import axios from "axios";
import AnimeDetail from "../model/AnimeDetail";

export default class Anilist {
  static async getDetail(title: string): Promise<AnimeDetail> {
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
  }
}
