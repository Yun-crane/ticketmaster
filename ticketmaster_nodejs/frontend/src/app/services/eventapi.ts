import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ArtistInfo } from "../model/artistinfo";
import { VenueInfo } from "../model/venueinfo";

@Injectable({
    providedIn: 'root'
})

export class eventservices {
    constructor(private http: HttpClient) {
    }

    private apiurl = '/api'

    fetchcardinfo(eventid: string) {
        return this.http.get<Response>(this.apiurl + `/event?id=${eventid}`)
    }

    fetchartinfo(artist: string) {
        return this.http.get<ArtistInfo>(this.apiurl + `/artist?name=${artist}`)
    }

    fetchvenueinfo(venue: string) {
        return this.http.get<VenueInfo>(this.apiurl + `/venue?name=${venue}`)
    }

}