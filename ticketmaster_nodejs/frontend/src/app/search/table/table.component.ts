import { Component, Input, OnInit } from '@angular/core';
import { eventservices } from 'src/app/services/eventapi';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit{
  
  constructor (private services: eventservices) {
  }

  ngOnInit(): void {
    
  }

  @Input() searchresult: any

  showdetailcard: boolean = false
  carddetails : any

  generatecard(eventid: string) {
    console.log(eventid)
    this.services.fetchcardinfo(eventid).subscribe(
      (data: Response) => {
        console.log(data)
        this.carddetails = data
        this.showdetailcard = true
      }
    )
  }

  showtable() {
    this.showdetailcard = false
  }
}
