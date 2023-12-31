import { Component, OnInit,ViewChild,Inject} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../common.service';
import { SuperadminService } from '../../superadmin.service';
// import { CommonService } from '../../superadmin.service';
// import { NotifierService } from 'angular-notifier';
import { PageEvent, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
// import { Memberlist } from '../../../../models/booking.model';
import { SampleService } from '../../sample.service';
import {MatDialog,MAT_DIALOG_DATA,MatDialogConfig} from '@angular/material';



@Component({
  selector: 'app-home',
  templateUrl: './membersapp.component.html',
})
export class MembersappComponent  {
	// private notifier: NotifierService;

  displayedColumns: string[] = ['date','aging','name','cname','addbank','Approval','Assign','topup'];
  samples:any;
  dataSource;

  
  constructor(private route:ActivatedRoute, private router:Router,
    // notifier: NotifierService ,
    private commonservice:CommonService, private service:SuperadminService,private excelservice:SampleService,public dialog: MatDialog) {		
      // this.notifier = notifier;
    }
    coins:any;
   @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

  
fetchdata:any;
model:any = {};
aa:any;
// posts:Memberlist[] = [];
totalPosts = 0;
postsPerPage = 300;
currentPage = 1;
pageSizeOptions = [ 300, 500, 1000];
isLoading = false;
emp = 2;
  ngOnInit() {
   

this.isLoading = true;
this.service.getCustomer(this.postsPerPage, this.currentPage);
this.service
.getCustomerDetails()
 .subscribe((postData: {posts: SuperadminService[], postCount: number})=> {
    this.totalPosts = postData.postCount;
    this.dataSource = new MatTableDataSource(postData.posts);
this.samples = postData.posts;
console.log(postData.posts);
this.isLoading = false;
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
    this.service.getCustomer(this.postsPerPage, this.currentPage);
  }
  
  data: any;

demo:any;
array=[];
abc:any;


exportAsXLSX():void {
  console.log(this.samples);
  let come=this.samples;
  var a;
  const fileName="Login List";
      for(let i=0;i< come.length;i++){
        this.array.push({
          // "Customer ID":this.samples[i].autoid,
          "applied date":this.samples[i].applieddate,
          "Customer Name":this.samples[i].name,
          "Mobile":this.samples[i].mobile,
          "EmailId":this.samples[i].email,
          "Address":this.samples[i].address,
          "Company Name":this.samples[i].cname,
          "Alternate Number":this.samples[i].altmobile,
          "Source":this.samples[i].source,
          "Loantype":this.samples[i].loantype,
          // "Executive Name":this.samples[i].execname,
          "Loan Amount":this.samples[i].amount,

        });
      }
        console.log(this.array);
                this.excelservice.JSONToCSVConvertor(this.array, "Report", true,fileName);
   }
  
  
   topupcustomer(element){
    this.commonservice.topupcustomer(element.idcustomer);
    // .subscribe(res=>{
    // console.log(res);
    // })
    }
 approvemember(element){
  console.log(element);
  this.commonservice.loginapprove(element);
}
// rejectmember(element)
// {
//   this.commonservice.rejectcustomer(element);

// }

hotCustomers(){
  // this.commonservice.hotcustomers();
  this.isLoading = true;
this.commonservice.hotCustomers(this.postsPerPage, this.currentPage);
this.commonservice
.hotCustomersDetails()
 .subscribe((postData: {posts: SuperadminService[], postCount: number})=> {
    this.totalPosts = postData.postCount;
    this.dataSource = new MatTableDataSource(postData.posts);
this.samples = postData.posts;
console.log(postData.posts);
this.isLoading = false;
this.dataSource.sort = this.sort;
console.log(this.dataSource.sort);

});
}

coldCustomers(){
  this.isLoading = true;
this.service.getCustomer(this.postsPerPage, this.currentPage);
this.service
.getCustomerDetails()
 .subscribe((postData: {posts: SuperadminService[], postCount: number})=> {
    this.totalPosts = postData.postCount;
    this.dataSource = new MatTableDataSource(postData.posts);
this.samples = postData.posts;
console.log(postData.posts);
this.isLoading = false;
this.dataSource.sort = this.sort;
console.log(this.dataSource.sort);

});
}


public showNotification(element): 
 
 void {  
    //  this.notifier.notify(element);

   console.log(element);
   this.commonservice.getaging(element).subscribe(res=>{
    console.log(res);
   })
}

refresh(): void {
  window.location.reload();
}

viewbank(element){
  this.commonservice.viewbank(element);
  }
 
  
  addbank(id){
    this.commonservice.addbank(id);
  
  }
  editcustomer(id){
  console.log(id);
  this.commonservice.editcustomer(id);
}


openDialog(element) {
this.model=element;
  const dialogConfig = new MatDialogConfig();
  dialogConfig.data = {element};
  this.dialog.open(DialogContent,dialogConfig
);
console.log(dialogConfig );

}


}


@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: 'dialog-content.html',
})

export class DialogContent{ 


  constructor(@Inject(MAT_DIALOG_DATA) public data:any) {}

//   constructor(
//     @Inject(MAT_DIALOG_DATA) public data: any
//  ) { }
 

}
// @Component({
//   selector: 'dialog-content-example-dialog',
//   templateUrl: './dialog_rejectreason.html',
// })

// export class RejectDialogContent {
// element:any;
//   constructor(@Inject(MAT_DIALOG_DATA) public data: any, 
//   private commonservice: CommonService ,private route: ActivatedRoute, private router: Router,) { }

//   //   constructor(
//   //     @Inject(MAT_DIALOG_DATA) public data: any
//   //  ) { }
//   rejectmember(element,obj) {

//     this.commonservice.rejectcustomer(element,obj);

//   }
//   refresh(): void {
//     window.location.reload();
//   }
// }
