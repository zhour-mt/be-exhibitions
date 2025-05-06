const {
  artworkData,
  userData,
  exhibitionData,
  exhibitionArtworksData,
} = require("../test-db/development-data/index.js");
const seed = require("./seed.js");
const db = require("../connection.js");

const runSeed = () => {
  return seed(
    artworkData,
    userData,
    exhibitionData,
    exhibitionArtworksData
  ).then(() => db.end());
};

runSeed();
