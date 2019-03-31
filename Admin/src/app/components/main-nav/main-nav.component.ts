import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent {

  showMenuBasics = false;
  showMenuStrategy = false;
  showMenuTrades = false;
  renderOptionBasics1 = false;
  renderOptionBasics2 = false;
  renderMyStatergy1 = false;
  renderMyStatergy2 = false;
  renderMyTrades1 = false;
  renderMyTrades2 =false;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver) {}

  initVars() {
    this.renderOptionBasics1 = false;
    this.renderOptionBasics2 = false;
    this.renderMyStatergy1 = false;
    this.renderMyStatergy2 = false;
    this.renderMyTrades1 = false;
    this.renderMyTrades2 =false;
  }

  toggleMenu(index) {
    if (index == 1) {
      this.showMenuBasics = !this.showMenuBasics;
    }
    else if( index == 2) {
      this.showMenuStrategy = !this.showMenuStrategy;
    }
    else if(index == 3) {
      this.showMenuTrades = !this.showMenuTrades;
    }    
 }

 renderOptionBasics(index) {
   if (index == 1) {
     this.initVars();
     this.renderOptionBasics1 = true;
   }
   else if(index == 2) {
    this.initVars();
    this.renderOptionBasics2 = true;
   }
 }

 renderMyStatergy(index) {
  if (index == 1) {
    this.renderMyStatergy1 = !this.renderMyStatergy1;
  }
  else if(index == 2) {
   this.renderMyStatergy2 = !this.renderMyStatergy2;
  }
 }
}
