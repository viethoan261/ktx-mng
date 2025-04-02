import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Room } from '../../../models/room.model';

@Component({
  selector: 'app-room-form-dialog',
  templateUrl: './room-form-dialog.component.html',
  styleUrls: ['./room-form-dialog.component.scss']
})
export class RoomFormDialogComponent implements OnInit {
  roomForm!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RoomFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { room?: Room }
  ) {
    this.isEditMode = !!data?.room;
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.roomForm = this.fb.group({
      roomNumber: [this.data?.room?.roomNumber || '', [Validators.required]],
      floor: [this.data?.room?.floor || '', [Validators.required, Validators.min(1)]],
      maxOccupancy: [this.data?.room?.maxOccupancy || '', [Validators.required, Validators.min(1)]],
      status: [this.data?.room?.status || 'empty', [Validators.required]],
      currentOccupancy: [this.data?.room?.currentOccupancy || 0, [Validators.min(0)]],
      description: [this.data?.room?.description || '']
    });

    // Disable currentOccupancy if status is not occupied
    this.roomForm.get('status')?.valueChanges.subscribe(status => {
      const currentOccupancyControl = this.roomForm.get('currentOccupancy');
      if (status === 'occupied') {
        currentOccupancyControl?.enable();
      } else {
        currentOccupancyControl?.disable();
        currentOccupancyControl?.setValue(0);
      }
    });
  }

  onSubmit(): void {
    if (this.roomForm.valid) {
      const formValue = this.roomForm.value;
      const room: Room = {
        id: this.data?.room?.id || 0,
        roomNumber: formValue.roomNumber,
        floor: formValue.floor,
        maxOccupancy: formValue.maxOccupancy,
        status: formValue.status,
        currentOccupancy: formValue.status === 'occupied' ? formValue.currentOccupancy : 0,
        description: formValue.description,
        createdAt: this.data?.room?.createdAt || new Date(),
        updatedAt: new Date()
      };
      this.dialogRef.close(room);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 