import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityFormDialogComponent } from './security-form-dialog.component';

describe('SecurityFormDialogComponent', () => {
  let component: SecurityFormDialogComponent;
  let fixture: ComponentFixture<SecurityFormDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SecurityFormDialogComponent]
    });
    fixture = TestBed.createComponent(SecurityFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
