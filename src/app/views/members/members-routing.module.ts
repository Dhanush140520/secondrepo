import { NgModule } from '@angular/core';
import { Routes,
     RouterModule } from '@angular/router';

// import { MembersComponent } from './members.component';
// import { BankapplyComponent} from './bankapply.component';
// import { ViewcustomerComponent } from './viewcustomer.component';
// import { BusinesslistComponent} from './businesslist.component';
// import {ViewbankComponent} from './viewbank.component';
// import {PdlistComponent} from './pdlist.component';
// import {ApprovalComponent} from './approval.component';
// import { BankRejectComponent } from './bankreject.component';
// import { CompletlistComponent } from './completlist.component';
// import { ViewmemberComponent} from './viewmember.component';
// import { MemberlistComponent} from './memberlist.component';
// import {DisbustedComponent} from '../extracodes/disbusted.component';
import { MembersappComponent} from './membersapp.component';
import { EditcustomersComponent } from './editcustomers.component';
import {BankdisburseComponent} from './bankdisburse.component';
import {TopuplistComponent} from './topuplist.component';
import {TopupnotifyComponent} from './topupnotify.component';
import {SuccesstopuplistComponent} from './successtopuplist.component';
import { CustStatusComponent } from './custstatus.component';
import { ViewCustomerComponent } from './viewcustomer.component';
import { BankRejectComponent } from './bankreject.component';
const routes: Routes = [
  {
    
    path: '',
    data: {
      title: 'Member'
    },
    children:[
      // {
      //   path:'add',
      //   component:MembersComponent,
      //   data:{
      //     title:'Add Members'
      //   }
      // },
      {
        path:'viewcustomer',
        component:MembersappComponent,
        data:{
          title:'Login List'
        }
      },  
      // {
      //   path:'memberlist',
      //   component:MemberlistComponent,
      //   data:{
      //     title:'Member list'
      //   }
      // },
      // {
      //   path:'viewmember',
      //   component:ViewmemberComponent,
      //   data:{
      //     title:'View Member'
      //   }
      // },
      {
        path:'editcustomer/:id',
        component:EditcustomersComponent,
        data:{
          title:'Edit Customer'
        }
      },
      {
        path: 'custstatus/:id',
        component: CustStatusComponent,
        data: {
          title: 'view bank to customer'
        }
      },

      // {
      //   path:'bankapply/:id',
      //   component:BankapplyComponent,
      //   data:{
      //     title:'Bank apply'
      //   }
      // },
      {
        path:'viewtopup',
        component:ViewCustomerComponent,
        data:{
          title:'View Customer'
        }
      },
      // {
      //   path:'businesslist',
      //   component:BusinesslistComponent,
      //   data:{
      //     title:' Add Employeetype'
      //   }
      // },
      // {
      //   path:'viewbank/:id',
      //   component:ViewbankComponent,
      //   data:{
      //     title:' View Banklist'
      //   }
      // },
      // {
      //   path:'pdlist',
      //   component:PdlistComponent,
      //   data:{
      //     title:'PD List'
      //   }
      // },
      // {
      //   path:'approve',
      //   component:ApprovalComponent,
      //   data:{
      //     title:'Approval List'
      //   }
      // },
      // {
      //   path:'disbursed',
      //   component:DisbustedComponent,
      //   data:{
      //     title:'Disbursed List'
      //   }
      // },
      
      {
        path:'bankdisburse/:id',
        component:BankdisburseComponent,
        data:{
          title:'Bank Disburse'
        }
      },
      {
        path:'topuplist/:id',
        component:TopuplistComponent,
        data:{
          title:'Topup list'
        }
      },
      {
        path:'topupnotifylist/:id',
        component:TopupnotifyComponent,
        data:{
          title:'Topup List'
        }
      },
      {
        path:'successtopuplist',
        component:SuccesstopuplistComponent,
        data:{
          title:'Successfull Topup List'
        }
      },
      {
        path:'bankreject/:id',
        component:BankRejectComponent,
        data:{
          title:'Bank List'
        }
      },
      // {
      //   path:'completlist',
      //   component:CompletlistComponent,
      //   data:{
      //     title:'Bank Reject List'
      //   }
      // }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MembersRoutingModule {}
