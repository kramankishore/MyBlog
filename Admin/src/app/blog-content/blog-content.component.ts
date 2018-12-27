import { Component, Input, Output, OnInit } from "@angular/core";

@Component({
  selector: "app-blog-content",
  templateUrl: "./blog-content.component.html",
  styleUrls: ["./blog-content.component.css"]
})
export class BlogContentComponent implements OnInit {
  tinymceInit = {
    plugins: "image link",
    convert_urls: true,
    relative_urls: false,
    remove_script_host: true,
    document_base_url: "http://localhost:8899/",
    images_upload_url: "blogContent/uploadImage",
    images_upload_handler: function(blobInfo, success, failure) {
      console.log("Image Upload!");

      var xhr, formData;

      xhr = new XMLHttpRequest();
      xhr.withCredentials = false;
      xhr.open("POST", "http://localhost:8899/blogContent/uploadImage");

      xhr.onload = function() {
        var json;

        if (xhr.status != 200) {
          failure("HTTP Error: " + xhr.status);
          return;
        }

        json = JSON.parse(xhr.responseText);

        if (!json || typeof json.location != "string") {
          failure("Invalid JSON: " + xhr.responseText);
          return;
        }

        success(json.location);
      };

      formData = new FormData();
      formData.append("file", blobInfo.blob(), blobInfo.filename());

      xhr.send(formData);
    }
  };

  @Input("parentOption") parentOption: string;
  @Input("childOption") childOption: string;
  @Output("childOption") output: string;

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
    if (this.parentOption == "1" && this.childOption == "1") {
      title = "Basics 1";
      content = "Content 1";
      return title + content;
    }
    if (this.parentOption == "1" && this.childOption == "2") {
      title = "Basics 2";
      content = "Content 2";
      return title + content;
    }
  }
}
