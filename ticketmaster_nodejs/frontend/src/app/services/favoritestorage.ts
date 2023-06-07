import { Injectable } from "@angular/core";
import { FavoriteInfo } from "../model/favoriteinfo";

@Injectable({
    providedIn: 'root'
})

export class favoriteservice {
  
    constructor() {
    }

    insertfavorite(eid:string, edate:string, ename:string, ecategory:string, evenue:string) {
      const info: FavoriteInfo = {
        id: eid, date: edate, name: ename, category: ecategory, venue: evenue
      }
      localStorage.setItem(eid, JSON.stringify(info))
    }

    deletefavorite(eid: string) {
        localStorage.removeItem(eid)
    }

    inFavoriteTable(eid: string) {
        const judge = localStorage.getItem(eid)
        return judge != undefined && judge != ''
    }

    emptystorage(): boolean {
        return localStorage.length == 0
    }

    getallfavorites(): Array<FavoriteInfo> {
        const infolist: Array<FavoriteInfo> = []
        Object.keys(localStorage).forEach(keyid => {
            const row: string = localStorage.getItem(keyid)!
            infolist.push(JSON.parse(row))
        })
        console.log(infolist)
        return infolist
    }

}