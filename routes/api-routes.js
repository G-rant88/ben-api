const db = require("../models");
const axios = require("axios");
const base64 = require('base-64');
const querystring = require('querystring');

module.exports = function(app) {

  app.post("/create/:isrc", async function(req, res) {
    let { isrc } = req.params;

    let trackCheck = await db.track.findAll({
      where: {
        isrc: isrc
      },

    }).then(function(results) {
      return results;
    });

    if(trackCheck.length){
      res.send("error track already exists in db: "+ isrc)
    }
    else{

    let client_auth = "99b92566d7c8409b97aa1d17c6f2260b:1a13b1a6a5ab406e998ecaa2ab1bfb30";
    let encoded = base64.encode(client_auth);
    let data = {
      grant_type: "client_credentials"
    }
    let headers = {
      headers: {
        "Authorization": "Basic " + encoded,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }

    const accessToken = await axios.post('https://accounts.spotify.com/api/token',
      querystring.stringify(data),
      headers
      )
      .then((response) => {
        return response.data.access_token;
      })
      .catch((error) => {
        console.log(error)
      })

      let headersAccess = {
        headers: {
          "Authorization": "Bearer " + accessToken,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }

      let track = await axios.get(`https://api.spotify.com/v1/search?q=isrc:${isrc}&type=track`,
      headersAccess
      )
      .then((response) => {
        let id = '';
        let popularity = 0;
        if(response.data.tracks.items.length > 1){
          for(let item of response.data.tracks.items){
            if(item.popularity > popularity){
              popularity = item.popularity;
              id = item.id
            }
          }
          let item = response.data.tracks.items.find(item => item.id === id);
          return item;
        }
        else{
          return response.data.tracks.items[0];
        }
      })
      .catch((error) => {
        console.log(error)
      })

      let artistNames = [];
      for(let artist of track.artists){
        artistNames.push(artist.name)
      }

      let artistsStr = JSON.stringify(artistNames);

      db.track.create({

        title: track.name,
        image: track.album.images[0].url,
        isrc: isrc,
        artist: artistsStr

      }).then(function(results) {

        console.log("track added:", isrc);
        console.log(results);

        res.json(results);
      });
    }

  });

  app.get("/get/track/:isrc", function(req, res) {
    let { isrc } = req.params;

    db.track.findAll({
      where: {
        isrc: isrc
      },

    }).then(function(results) {
      res.json(results);
    });
  });

  app.get("/get/artist/:artist", function(req, res) {
    let { artist } = req.params;

    db.track.findAll({
      where: {
        artist: {
          $like: `%${artist}%`
        }
      },

    }).then(function(results) {
      res.json(results);
    });

  });

};