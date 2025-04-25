const { selectArtworks, selectArtworkById } = require("../models/artworks-models")


exports.getArtworks = (request, response, next) => {
    selectArtworks().then((results) => {
        response.status(200).send({ artworks: results });
    })
}

exports.getArtworkById = (request, response, next) => {
    const { artwork_id } = request.params;

    selectArtworkById(artwork_id).then((result) => {
        response.status(200).send({ artwork: result });
    })
}
