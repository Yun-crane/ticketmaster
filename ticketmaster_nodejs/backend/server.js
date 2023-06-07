import express from "express";
import SpotifyWebApi from "spotify-web-api-node";
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fetch from "node-fetch";
import geohash from 'ngeohash';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const app = express();
//var cors = import('cors');
const port = process.env.PORT || 3000
//const fetch =import('node-fetch');
//const path = import('path');
//var geohash = import('ngeohash')
//const SpotifyWebApi = import('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
    clientId: 'cf79b6edec2f4c98a0b6f2326c5f8c93',
    clientSecret: '87c08b90d36743fda687cad375fd2bec',
})
const ticket_api = '200YbhNbPdkoJdJnvDUKb0UKNbLmg4d6'
//console.log(geohash.encode(37.8324,112.5584))
const cat_map = {'music':'KZFzniwnSyZfZ7v7nJ', 'sports':'KZFzniwnSyZfZ7v7nE', 'arts':'KZFzniwnSyZfZ7v7na', 'film':'KZFzniwnSyZfZ7v7nn', 'mix':'KZFzniwnSyZfZ7v7n1','all':''}

app.use(express.static(path.join(__dirname,'/dist/ticket-app')))
app.use(cors())

const buildsearchurl = (rquery) => {
    console.log(rquery)
    const catvalue = rquery.category
    const searchurl = `https://app.ticketmaster.com/discovery/v2/events.json?`
    +`apikey=${ticket_api}`
    +`&keyword=${rquery.keyword}`
    +`&segmentId=${cat_map[catvalue]}`
    +`&radius=${rquery.distance}`
    +`&unit=miles&geoPoint=${geohash.encode(rquery.latitude, rquery.longitude)}`

    return searchurl
}

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname,'/dist/ticket-app/index.html'))
})

app.get('/api/auto-complete', (req,res) => {
    const input = req.query.text
    const suggesturl = `https://app.ticketmaster.com/discovery/v2/suggest?`
    +`apikey=${ticket_api}`
    +`&keyword=${input}`

    try {
        fetch(suggesturl)
        .then(result=>result.text())
        .then(body=>JSON.parse(body))
        .then(jsob=> {
            if (jsob._embedded != null) {
                const atarray = jsob._embedded.attractions.map(function (attr) {
                return attr.name
                })
                return atarray
            } else {
                return null
            }
        })
        .then(attrarray=> {
            console.log(attrarray)
            res.send(attrarray)
        })
    } catch(e) {
        console.log(e)
        res.send(e)
    }
})

app.get('/api/search', (req, res) => {
    const searchurl = buildsearchurl(req.query)
    fetch(searchurl)
        .then(result=>result.text())
        .then(body=>JSON.parse(body))
        .then(jsob=> {
            console.log(jsob)
            if (jsob._embedded != null) {
                const results = jsob._embedded.events.map(function (curE) {
                    return {
                        "id": curE.id,
                        "date": curE.dates.start.localDate,
                        "time": curE.dates.start.localTime || '',
                        "iconurl": curE.images[0].url,
                        "event": curE.name,
                        "genre": curE.classifications[0].segment.name,
                        "venue": curE._embedded.venues[0].name
                    }
                }).slice(0,20)
                results.sort((s,t) => {
                    if (s.date<t.date) { return -1 }
                    else if (s.date==t.date && s.time<t.time) { return -1 }
                    else { return 1}
                })
                console.log(results)
                res.send(results)
            } else {
                res.send([])
            }
        })
})

app.get('/api/event', (req,res) => {
    const eid = req.query.id
    const eventurl = `https://app.ticketmaster.com/discovery/v2/events/${eid}?`
    +`apikey=${ticket_api}`
    fetch(eventurl).then(result => result.text())
      .then(body => JSON.parse(body))
      .then(details => {res.send(details)})
})

app.get('/api/artist', (req,res) => {
    const keyword = req.query.name
    spotifyApi.clientCredentialsGrant().then(
        function(data) {
          console.log(data.body['access_token'])
          spotifyApi.setAccessToken(data.body['access_token'])
          spotifyApi.searchArtists(keyword).then(
            function(result) {
                if (result.body.artists.items[0] != null) {
                    //console.log(result)
                    const artid = result.body.artists.items[0].id
                    const albumlist = []
                    const cinfo = {
                        "id": result.body.artists.items[0].id,
                        "name": result.body.artists.items[0].name,
                        "imageurl": result.body.artists.items[0].images[0].url,
                        "followers": result.body.artists.items[0].followers.total,
                        "popularity": result.body.artists.items[0].popularity,
                        "link": result.body.artists.items[0].external_urls.spotify,
                        "albums": []
                    }
                    spotifyApi.getArtistAlbums(artid,{limit: 3}).then(
                        resp => {
                        console.log(resp)
                        resp.body.items.forEach((obj, index) => {
                            cinfo['albums'].push(obj.images[0].url)
                        })
                        console.log(cinfo)
                        res.send(cinfo)
                        }
                    )
                    /*console.log(albumlist)
                    const cinfo = {
                        "id": result.body.artists.items[0].id,
                        "name": result.body.artists.items[0].name,
                        "imageurl": result.body.artists.items[0].images[0].url,
                        "followers": result.body.artists.items[0].followers.total,
                        "popularity": result.body.artists.items[0].popularity,
                        "link": result.body.artists.items[0].external_urls.spotify
                    }
                    console.log(cinfo)
                    res.send(cinfo)*/
                } else {
                    res.send({})
                }
            }
        )
    },
    function(err) {
        console.log(err.message)
    })

})

app.get('/api/venue', (req,res) => {
    const vname = req.query.name
    const keyv = vname.replaceAll(' ','%')
    console.log(keyv)
    const venueurl = `https://app.ticketmaster.com/discovery/v2/venues.json?keyword=${keyv}&`
    +`apikey=${ticket_api}`
    fetch(venueurl).then(result => result.text())
      .then(body => JSON.parse(body))
      .then(vinfo => {
        if (vinfo._embedded != null) {
            let vnname = vinfo._embedded.venues[0].name
            let vnaddr = ''
            let vncity = ''
            let vnstate = ''
            let vnphone = ''
            let vnopen = ''
            let vngrule = ''
            let vncrule = ''
            let vnlng = vinfo._embedded.venues[0].location.longitude
            let vnlat = vinfo._embedded.venues[0].location.latitude
            /*if (vinfo._embedded.venues[0].location != null) {
                vnlng = vinfo._embedded.venues[0].location.longitude
                vnlat = vinfo._embedded.venues[0].location.latitude
            }*/
            if (vinfo._embedded.venues[0].address != null) {
                vnaddr = vinfo._embedded.venues[0].address.line1
            }
            if (vinfo._embedded.venues[0].city != null) {
                vncity = vinfo._embedded.venues[0].city.name
            }
            if (vinfo._embedded.venues[0].state != null) {
                vnstate = vinfo._embedded.venues[0].state.name
            }
            if (vinfo._embedded.venues[0].boxOfficeInfo != null) {
                if (vinfo._embedded.venues[0].boxOfficeInfo.phoneNumberDetail != null) {
                    vnphone = vinfo._embedded.venues[0].boxOfficeInfo.phoneNumberDetail
                }
                if (vinfo._embedded.venues[0].boxOfficeInfo.openHoursDetail != null) {
                    vnopen = vinfo._embedded.venues[0].boxOfficeInfo.openHoursDetail
                }
            }
            if (vinfo._embedded.venues[0].generalInfo != null) {
                if (vinfo._embedded.venues[0].generalInfo.generalRule != null) {
                    vngrule = vinfo._embedded.venues[0].generalInfo.generalRule
                }
                if (vinfo._embedded.venues[0].generalInfo.childRule != null) {
                    vncrule = vinfo._embedded.venues[0].generalInfo.childRule
                }
            }
            const vninfo = {
                "name": vnname,
                "address": vnaddr,
                "city": vncity,
                "state": vnstate,
                "phonenumber": vnphone,
                "openhours": vnopen,
                "genrule": vngrule,
                "chirule": vncrule,
                "longitude": vnlng,
                "latitude": vnlat
            }
            console.log(vninfo)
            res.send(vninfo)
        } else {
            res.send({})
        }
      })
})

app.listen(port, () => {
    console.log(`server on port ${port}`)
})