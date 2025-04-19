import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationFormDialogComponent } from './notification-form-dialog.component';

describe('NotificationFormDialogComponent', () => {
  let component: NotificationFormDialogComponent;
  let fixture: ComponentFixture<NotificationFormDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationFormDialogComponent]
    });
    fixture = TestBed.createComponent(NotificationFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
