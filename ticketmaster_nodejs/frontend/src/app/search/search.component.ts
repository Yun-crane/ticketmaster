import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from "@angular/forms";
import { debounceTime, distinctUntilChanged, filter, Observable, startWith, switchMap, of } from "rxjs";
import { searchservices } from "../services/searchapi";
import { HttpClient } from '@angular/common/http';
import { ResultTable } from '../model/tabledata';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})


export class SearchComponent implements OnInit {
  constructor(
    private services: searchservices,
    private formbuild: FormBuilder,
    private http: HttpClient
){}

searchform = this.formbuild.group({
    keyword: "",
    distance: null,
    category: 'all',
    location: "",
    autocheck: [false]
})

showemptyresult= false
showresulttable= false
resultTable: any
autocompleteresults : any
defaultdist = 10
coord : any
latvar  = ''
longvar = ''
params : any


ngOnInit(): void {
    this.initautocomplete()
    this.initcheckbox()
    this.autodetectlocation()
}

initautocomplete() {
    this.searchform.controls.keyword.valueChanges.pipe(
        startWith(''),
        filter(keyword => {
            return keyword != null && keyword.length>=1
        }),
        distinctUntilChanged(),
        debounceTime(300),
        switchMap(value => {
            console.log(`current key is ${value}`)
            return this.services.fetchautocomplete(value!)
        })
    ).subscribe((data:any) => {
        console.log(data)
        this.autocompleteresults = data
    })
}

initcheckbox(){
    this.searchform.get('autocheck')?.valueChanges.subscribe(
        checked => {
            if (checked) {
                this.searchform.get('location')?.reset()
                this.searchform.get('location')?.disable()
            }
            else {
                this.searchform.get('location')?.enable()
            }
        }
    )
}

formsubmit() {
    console.log(this.searchform.value)
    this.fetchtable()
}

clearform() {
    this.autocompleteresults = []
    this.searchform.reset({
        category: 'all'
    })
    this.showresulttable = false
    this.showemptyresult = false
}

async autodetectlocation() {
    const iPInfokey = "f24a7a3febf991"
    const iPInfourl = `https://ipinfo.io?token=${iPInfokey}`
    await this.http.get(iPInfourl).subscribe(
        data => {
            this.coord = JSON.parse(JSON.stringify(data)).loc
        }
    )
}

async geoloc(address: string): Promise<number[]> {
    const Geocodingkey = "AIzaSyA6jlUondXF_ydECkNkcmhW3hEafH6FDe0"
    let geourl = "https://maps.googleapis.com/maps/api/geocode/json?"
    geourl += `address=${address}&key=${Geocodingkey}`
    try {
        const locpair = await fetch(geourl).then(res => res.json())
        .then(attrs => {
            const lat = attrs.results[0].geometry.location.lat;
            const lng = attrs.results[0].geometry.location.lng;
            return [lat,lng]
        });
        return locpair
    } catch(e) {
        console.log(e)
        return [0,0]
    }
}

async geodetectlocation(locationtext: string) {
    await Promise.resolve(this.geoloc(locationtext)).then(
        (valuepair) => {
            this.latvar = String(valuepair[0])
            this.longvar = String(valuepair[1])
        }
    )
}

async fetchtable() {
    const stuff = this.searchform.getRawValue()
    if (stuff.autocheck) {
        this.latvar = this.coord.split(',')[0]
        this.longvar = this.coord.split(',')[1]
    } else {
        const locationtext = stuff.location!
        await this.geodetectlocation(locationtext)
    }

    await this.services.fetchsearchresult(stuff.keyword, stuff.distance || this.defaultdist, stuff.category, this.latvar, this.longvar).subscribe(
        (data: ResultTable[]) => {
            if (data.length == 0) {
                this.showemptyresult = true
                this.showresulttable = false
            } else {
                console.log('table generated')
                this.showemptyresult = false
                this.showresulttable = true
                this.resultTable = data
            }
        }
    )
}
}
