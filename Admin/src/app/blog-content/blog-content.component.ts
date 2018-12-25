import { Component, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-blog-content',
  templateUrl: './blog-content.component.html',
  styleUrls: ['./blog-content.component.css']
})
export class BlogContentComponent implements OnInit {

  @Input('parentOption') parentOption: string;
  @Input('childOption') childOption: string;
  @Output('childOption') output: string;

  constructor() {
    //var output;
   }

  ngOnInit() {
    let URL = "http://xyx:5050";
    console.log(this.parentOption);
    console.log(this.childOption);
    this.output = this.serverOutput();
    //console.log(URL + "?parentOption=" + this.parentOption + ",childOption=" + this.childOption);
  }

  serverOutput() {
    var title;
    var content;
    if(this.parentOption == "1" && this.childOption == "1") {
      title = "Basics 1";
      content = "Content 1";
      return title + content;
    }
    if(this.parentOption == "1" && this.childOption == "2") {
      title = "Basics 2";
      content = "Content 2";
      return title + content;
    }
  }

}
