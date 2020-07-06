import * as xml2js from "xml2js";

export async function xmlStringToJson(string) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(string, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}
