import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { DocumentCamRoutingModule} from './documentcam-routing.module';


import {MatDatepickerModule, MatNativeDateModule, MatInputModule,MatFormFieldModule, MatPaginatorModule, MatSortModule, MatTableModule, MatProgressSpinnerModule, MatBadgeModule, MatButtonModule, MatButtonToggleModule} from '@angular/material';
import { TestComponent } from './test.component';

@NgModule({
  imports: [CommonModule,FormsModule,ReactiveFormsModule,MatNativeDateModule,MatInputModule,
    MatDatepickerModule,MatFormFieldModule,MatBadgeModule,MatButtonModule,MatButtonToggleModule,
    MatPaginatorModule,MatSortModule,MatProgressSpinnerModule,MatTableModule,DocumentCamRoutingModule,
    
  ],
  declarations: [TestComponent,
 ],
  entryComponents: [
  ],
})
export class DocumentCamModule { }
