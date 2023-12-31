import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../common.service';

@Component({
  selector: 'app-home',
  templateUrl: './dailyroutineedit.component.html',
//   styleUrls: ['./loantype.component.scss']
})
export class DailyRoutineEditComponent implements OnInit {

  constructor( private route: ActivatedRoute, private router:Router,private service: CommonService) { }

  
obj:any;
fetchData:any;
model: any = {};

  idvalue;

  onSubmit(){
    console.log(this.model);
    // const empid=localStorage.getItem("id");
    
    this.service.editroutine(this.model)
    
    .subscribe(res=>{
        console.log(res);
        this.router.navigate(["/executives/dailyroutineview"]);
    })
   }

  ngOnInit() {
     
  this.service.getbankname().subscribe(res=>{
    console.log(res);
    this.fetchData=res;
  })
  this.route.params.subscribe(params => {
    console.log(params['id']);
    this.idvalue = params['id'];
    this.service.editdata1(this.idvalue).subscribe(res => {
      console.log(res);
      this.model = res[0];
    });
  })

  }
  refresh(): void {
    window.location.reload();
  }
  editproject(pro){
    console.log(pro);
    this.model = pro;
  }
}
