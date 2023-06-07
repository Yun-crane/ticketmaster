import { Component, OnInit } from '@angular/core';
import { favoriteservice } from '../services/favoritestorage';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  
  favoritelist : any
  emptylist: boolean = true

  constructor (
    private localstorage: favoriteservice
  ) {
    this.updatelist()
  }

  ngOnInit(): void {
  }

  updatelist() {
    this.favoritelist = this.localstorage.getallfavorites()
    this.emptylist = this.localstorage.emptystorage()
  }

  cancelfavorite(eventid: string) {
    alert("Removed from favorites!")
    this.localstorage.deletefavorite(eventid)
    this.updatelist()
  }


}
