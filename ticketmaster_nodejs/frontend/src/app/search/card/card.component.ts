import { Component, Input, EventEmitter, Output, OnInit, AfterViewInit } from '@angular/core';
import { RadioControlValueAccessor } from '@angular/forms';
import { favoriteservice } from 'src/app/services/favoritestorage';
import { eventservices } from 'src/app/services/eventapi';
import { ArtistInfo } from 'src/app/model/artistinfo';
import { VenueInfo } from 'src/app/model/venueinfo';
import { DataRowOutlet } from '@angular/cdk/table';
import { catchError, Observable, of, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
//import { NgbCarousel, NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit, AfterViewInit {

  @Input() eventresult: any
  @Output() backlistener = new EventEmitter<boolean>()
  
  inFavorites: boolean = false
  eventid: string = ''
  eventname: string = ''
  eventdate: string = ''
  eventart: string = ''
  eventvenue: string = ''
  eventgenre: string = ''
  eventprice: string = ''
  ticketstatus: string = 'No information'
  buylink: string = ''
  maplink: string = ''
  artists: Array<string> = []
  count: number = 0 // count for music related artists
  colorStatus = "blue"
  sleep = (ms:any) => new Promise(r => setTimeout(r, ms));
  statusinfo = ""
  artistsinfo: Array<any> = []
  venuename: string = ''
  venueaddress: string = ''
  venuephone: string = ''
  openhours: string = ''
  generalrule: string = ''
  childrule: string = ''

  mapkey: string = 'AIzaSyBz9uiddPOCmKQLont6CZVn9GLmXkpLGbo'
  


  showdate: boolean = false
  showteam: boolean = false
  showvenue: boolean = false
  showgenre: boolean = false
  showrange: boolean = false
  showstatus: boolean = false
  showlink: boolean = false
  showseat: boolean = false
  showaddress: boolean = false
  showphone: boolean = false
  showhours: boolean = false
  showgrule: boolean = false
  showcrule: boolean = false
  showo: boolean = false
  showg: boolean = false
  showc: boolean = false 

  center: google.maps.LatLngLiteral = { lat: 38.9987208, lng: -77.2538699 };
  mapOptions: google.maps.MapOptions = {
    center: { lat: 38.9987208, lng: -77.2538699 },
    zoom : 14
 }
 marker = {
    position: { lat: 38.9987208, lng: -77.2538699 },
 }
 maploaded: Observable<boolean>
  
  constructor(
    private localstorage: favoriteservice,
    private services: eventservices,
    private httpclient: HttpClient
  ) {
    this.maploaded = httpclient.jsonp(`https://maps.googleapis.com/maps/api/js?key=${this.mapkey}`,'callback')
      .pipe( map(() => {
        console.log("Google Map loaded")
        return true
      }),
      catchError((err, caught) => {
        console.log(`catch error of ${err}`)
        return of(false)
      }),
      )
  }

  ngAfterViewInit() : void {
      const staele = document.getElementById("ticketstatus")!
      staele.style.paddingTop = "3px"
      staele.style.paddingBottom = "3px"
      if (this.statusinfo == "onsale") {
          staele.innerText = "On Sale"
          staele.style.backgroundColor = "Green"
          //staele.style.width = "60px"
          //this.colorStatus = "Green"
      }
      if (this.statusinfo == "offsale") {
          staele.innerText = "Off Sale"
          staele.style.backgroundColor = "Red"
          //staele.style.width = "60px"
          //this.colorStatus = "Red"
      }
      if (this.statusinfo == "canceled") {
          staele.innerText = "Canceled"
          staele.style.backgroundColor = "Black"
          //staele.style.width = "70px"
      }
      if (this.statusinfo == "postponed") {
          staele.innerText = "Postponed"
          staele.style.backgroundColor = "Orange"
          //staele.style.width = "80px"
      }
      if (this.statusinfo == "rescheduled") {
          staele.innerText = "Rescheduled"
          staele.style.backgroundColor = "Orange"
          //staele.style.width = "90px"
      }

      setTimeout(()=> {this.inFavorites = this.localstorage.inFavoriteTable(this.eventresult.id)},0)
  }
   
  ngOnInit(): void {
    this.initdetailcard()
    this.initartistcard()
    this.initvenuecard()
  }

  backtotable() {
    this.backlistener.emit(true)
  }


  initdetailcard() {
    const cardinfo = this.eventresult
    console.log(cardinfo)
    this.eventid = cardinfo.id
    this.eventname = cardinfo.name

    if (cardinfo.dates.start.localDate!=null && cardinfo.dates.start.localTime!=null) {
      this.showdate = true
      this.eventdate = cardinfo.dates.start.localDate +' '+ cardinfo.dates.start.localTime
    }
    else if (cardinfo.dates.start.localDate!=null) {
      this.showdate = true
      this.eventdate = cardinfo.dates.start.localDate
    }
    
    if (cardinfo._embedded.attractions != null) {
      this.showteam = true
      const atinfo = cardinfo._embedded.attractions
      const atindex = atinfo.length-1
      atinfo.forEach((cartm: any, index: number) => {
          this.eventart += cartm.name
          if (index != atindex) {
            this.eventart += ' | '
          }
          if (cartm.classifications != null) {
            if (cartm.classifications[0].segment.name == 'Music') {
              this.count += 1
              this.artists.push(cartm.name)
            }
          }
      })
      console.log(this.artists)
    }

    if (cardinfo._embedded.venues != null) {
      this.showvenue = true
      this.eventvenue = cardinfo._embedded.venues[0].name
    }

    if (cardinfo.classifications != null) {
      this.showgenre = true
      const classinfo = cardinfo.classifications
      if (classinfo[0].segment != null && classinfo[0].segment.name != 'Undefined') {
        this.eventgenre += `${classinfo[0].segment.name} | `
      }
      if (classinfo[0].genre != null && classinfo[0].genre.name != 'Undefined') {
        this.eventgenre += `${classinfo[0].genre.name} | `
      }
      if (classinfo[0].subGenre != null && classinfo[0].subGenre.name != 'Undefined') {
        this.eventgenre += `${classinfo[0].subGenre.name} | `
      }
      if (classinfo[0].type != null && classinfo[0].type.name != 'Undefined') {
        this.eventgenre += `${classinfo[0].type.name} | `
      }
      if (classinfo[0].subType != null && classinfo[0].subType.name != 'Undefined') {
        this.eventgenre += `${classinfo[0].subType.name} | `
      }
      this.eventgenre = this.eventgenre.slice(0,-3)
    }

    if (cardinfo.priceRanges != null) {
      this.showrange = true
      this.eventprice = cardinfo.priceRanges[0].min + ' - ' + cardinfo.priceRanges[0].max
    }

    if (cardinfo.dates.status.code != null) {
      // this.sleep(5000);
      this.statusinfo = cardinfo.dates.status.code
      this.showstatus = true
    }

    if (cardinfo.url != null) {
      this.showlink = true
      this.buylink = cardinfo.url
    }

    if (cardinfo.seatmap != null) {
      this.showseat = true
      this.maplink = cardinfo.seatmap.staticUrl
    }

  }

  initartistcard() {
    console.log(this.artists)
    this.artists.forEach((cart, index) => {
      this.services.fetchartinfo(cart).subscribe(
      (data: ArtistInfo) => {
        console.log(data)
        if (data.id != null) {
          this.artistsinfo.push(data)
        } else {
          this.count -= 1
        }
      }
    )
    })
  }

  initvenuecard() {
    console.log(this.eventvenue)
    this.services.fetchvenueinfo(this.eventvenue).subscribe(
      (data: VenueInfo) => {
        console.log(data)
        this.venuename = data.name || this.eventvenue
        if (data.address) {
          this.venueaddress += data.address
          this.venueaddress += ", "
        }
        if (data.city) {
          this.venueaddress += data.city
          this.venueaddress += ", "
        }
        if (data.state) {
          this.venueaddress += data.state
          this.venueaddress += ", "
        }
        if (this.venueaddress) {
          this.showaddress = true
          this.venueaddress = this.venueaddress.slice(0,-2)
        }
        if (data.phonenumber) {
          this.showphone = true
          this.venuephone = data.phonenumber
        }
        if (data.openhours) {
          this.showhours = true
          this.openhours = data.openhours
        }
        if (data.genrule) {
          this.showgrule = true
          this.generalrule = data.genrule
        }
        if (data.chirule) {
          this.showcrule = true
          this.childrule = data.chirule
        }
        const mapcenter = {
          lat: Number(data.latitude || 38.9987208),
          lng: Number(data.longitude || -77.2538699)
        }
        console.log(mapcenter)
        this.mapOptions.center = mapcenter
        this,this.center = mapcenter
        console.log(this.mapOptions)
        this.marker.position = mapcenter
        console.log(this.marker)
      }
    )

  }

  addfavorite() {
    this.inFavorites = true
    alert("Event Added to Favorites!")
    this.localstorage.insertfavorite(this.eventid, this.eventdate, this.eventname, this.eventgenre, this.eventvenue)
  }

  cancelfavorite() {
    this.inFavorites = false
    alert("Event Removed from Favorites!")
    this.localstorage.deletefavorite(this.eventresult.id)
  }

}
