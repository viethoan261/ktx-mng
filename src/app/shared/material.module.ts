import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
// ... các import khác tùy thuộc vào nhu cầu

@NgModule({
  exports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    // ... các modules khác
  ]
})
export class MaterialModule { } 