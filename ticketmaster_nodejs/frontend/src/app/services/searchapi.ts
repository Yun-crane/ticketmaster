import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ResultTable } from "../model/tabledata";

@Injectable({
    providedIn: 'root'
})

export class searchservices {

    constructor(private http: HttpClient) {        
    }

    private apiurl = '/api'
    //private def_category = 'all'

    fetchautocomplete(inputkey: string = 'all') {
        return this.http.get<Response>(this.apiurl + `/auto-complete?text=${inputkey}`)
    }

    fetchsearchresult(keyword: string | null, distance: number | null =10, category: string | null, latitude: string | null, longitude: string | null) {
        return this.http.get<ResultTable[]>(this.apiurl + `/search?keyword=${keyword}&distance=${distance}&category=${category}&latitude=${latitude}&longitude=${longitude}`)
    }
}