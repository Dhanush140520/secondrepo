import { Component, OnInit,ViewChild,Inject} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../common.service';
import { SuperadminService } from '../../superadmin.service';
// import { CommonService } from '../../superadmin.service';

import { PageEvent, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
// import { Memberlist } from '../../../../models/booking.model';
import { SampleService } from '../../sample.service';
import {MatDialog,MAT_DIALOG_DATA,MatDialogConfig} from '@angular/material';

// export interface DialogData {
// this.model;
// }


@Component({
  selector: 'app-home',
  templateUrl: './employeelist.component.html',
})
export class EmployeelistComponent  {

  displayedColumns: string[] = ['name','mobile','email','bankname','Edit','View','Delete'];
  samples:any;
  dataSource;

  constructor(private route:ActivatedRoute, private router:Router,
    private commonservice:CommonService, private service:SuperadminService,private excelservice:SampleService,public dialog: MatDialog) { }
    coins:any;
   @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

  
fetchdata:any;
model:any = {};
aa:any;
// posts:Memberlist[] = [];
totalPosts = 0;
postsPerPage = 100;
currentPage = 1;
pageSizeOptions = [ 100, 300, 500];
isLoading = false;
emp = 2;
  ngOnInit() {
   

this.isLoading = true;
this.commonservice.getemployeelist(this.postsPerPage, this.currentPage);
this.commonservice
.getemployeeDetails()
 .subscribe((postData: {posts: SuperadminService[], postCount: number})=> {
  
    this.totalPosts = postData.postCount;
    this.dataSource = new MatTableDataSource(postData.posts);
    // this.dataSource = new (postData.posts);
    this.samples = postData.posts;
    this.isLoading = false;
  console.log(postData.posts);
  console.log(postData.postCount);
  this.dataSource.sort = this.sort;
console.log(this.dataSource.sort);
});

  
  }
  applyFilter(filterValue: string) {
    console.log(filterValue);
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    console.log(this.postsPerPage);
    this.commonservice.getemployeelist(this.postsPerPage, this.currentPage);
  }
  
  data: any;

demo:any;
array=[];
abc:any;
 
exportAsXLSX():void {
  console.log(this.samples);
  let come=this.samples;
  var a;
  const fileName="Employee List";
      for(let i=0;i< come.length;i++){
        this.array.push({
          // "Customer ID":this.samples[i].autoid,
          "Employee Name":this.samples[i].name,
          "Mobile":this.samples[i].mobile,
          "EmailId":this.samples[i].email,
          "Address":this.samples[i].address,
          // "Executive Name":this.samples[i].execname,
          "Role":this.samples[i].user,

        });
      }
        console.log(this.array);
                this.excelservice.JSONToCSVConvertor(this.array, "Report", true,fileName);
   }
rejectmember(element)
{
  this.service.rejectmember(element);

}
editmember(id){
    console.log(id);
    this.commonservice.editmember(id);

}


refresh(): void {
  window.location.reload();
}

deleteemp(element){
console.log(element);
this.commonservice.deleteemp(element);

}

openDialog(element) {

this.model=element;

  const dialogConfig = new MatDialogConfig();
  dialogConfig.data = {element};

   this.dialog.open(EmpdialogContent,dialogConfig
 
  
);
console.log(dialogConfig );

}
}


@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: 'exedialog-content.html',
})

export class EmpdialogContent{ 


  constructor(@Inject(MAT_DIALOG_DATA) public data:any) {}

//   constructor(
//     @Inject(MAT_DIALOG_DATA) public data: any
//  ) { }
 

}
