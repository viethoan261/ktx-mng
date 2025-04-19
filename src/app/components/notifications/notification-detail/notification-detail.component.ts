import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Notification } from '../notification-form-dialog/notification-form-dialog.component';

@Component({
  selector: 'app-notification-detail',
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss']
})
export class NotificationDetailComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { notification: Notification }
  ) {}
} 