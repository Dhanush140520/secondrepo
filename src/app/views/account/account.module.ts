import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatDatepickerModule, MatNativeDateModule, MatInputModule,MatFormFieldModule, 
        MatPaginatorModule, MatSortModule, MatTableModule, MatProgressSpinnerModule,
        MatBadgeModule, MatButtonModule, MatButtonToggleModule} from '@angular/material';
import { AccountRoutingModule } from './account-routing.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CdkTableModule } from '@angular/cdk/table';
import { SubvendorComponent} from './subvendor.component';
import { DisburselistComponent,Empdialog1Content,Empdialog2Content} from './disburselist.component';
import { CustomerlistComponent,EmpdialogContent} from './customerlist.component';
import { ReloanComponent} from './reloan.component';



@NgModule({
  imports: [
    CommonModule,
    AccountRoutingModule,
    ChartsModule,
    FormsModule,
    ReactiveFormsModule,
    BsDropdownModule,

    MatNativeDateModule,
    MatInputModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatBadgeModule,
    MatButtonModule,
    MatButtonToggleModule,
    CdkTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatTableModule,
    ModalModule.forRoot(),
    
    // NotifierModule.withConfig(customNotifierOptions)
            
  ],
  declarations: [ SubvendorComponent,CustomerlistComponent,EmpdialogContent,DisburselistComponent,
    Empdialog1Content,Empdialog2Content,ReloanComponent,],
  entryComponents: [EmpdialogContent,CustomerlistComponent,Empdialog1Content,Empdialog2Content,
    DisburselistComponent
  ],

  // declarations: [AddapprovalComponent, DialogContent],
  bootstrap: [CustomerlistComponent],
  providers: []
})
export class AccountModule { }
