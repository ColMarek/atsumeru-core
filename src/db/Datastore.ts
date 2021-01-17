import AnimeDetail from "../model/AnimeDetail";
import * as fs from "fs";
import * as path from "path";
import * as nedb from "nedb";

export default class Datastore {
  db: nedb;

  constructor(dataDir: string) {
    const baseDir = path.join(dataDir, "data");
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir);
    }
    const dbVersionPath = path.normalize(`${baseDir}/db-version`);
    const cacheDbPath = path.normalize(`${baseDir}/anime-detail-db`);

    const expectedVersion = 1;

    if (fs.existsSync(dbVersionPath)) {
      const actualVersion = parseInt(fs.readFileSync(dbVersionPath).toString());
      if (actualVersion != expectedVersion) {
        fs.unlinkSync(cacheDbPath);
        fs.writeFileSync(dbVersionPath, expectedVersion.toString());
      }
    } else {
      fs.writeFileSync(dbVersionPath, expectedVersion.toString());
    }

    this.db = new nedb({
      filename: cacheDbPath,
      autoload: true,
    });
  }

  async saveAnimeDetail(detail: AnimeDetail) {
    return new Promise((resolve, reject) => {
      const data = { _id: detail.title, ...detail };
      this.db.insert(data, (err, doc) => {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    });
  }

  async findAnimeDetail(title: string): Promise<AnimeDetail> {
    return new Promise((resolve, reject) => {
      this.db.find({ _id: title }, (err, doc) => {
        if (err) {
          reject(err);
        } else {
          if (doc.length == 0) {
            resolve(null);
          } else {
            resolve(doc[0]);
          }
        }
      });
    });
  }
}
