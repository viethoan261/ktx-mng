import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Price } from '../../models/price.model';
import { PriceService } from '../../services/price.service';

@Component({
  selector: 'app-prices',
  templateUrl: './prices.component.html',
  styleUrls: ['./prices.component.scss']
})
export class PricesComponent implements OnInit {
  prices: Price[] = [];
  displayedColumns: string[] = ['id', 'electricityPrice', 'waterPrice', 'servicePrice', 'roomPrice', 'createdDate'];
  loading = false;
  priceForm: FormGroup = this.fb.group({});
  isCreating = false;
  formSubmitted = false;

  constructor(
    private priceService: PriceService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  // Custom validator that only returns errors when form is submitted
  conditionalValidator(standardValidator: (control: AbstractControl) => ValidationErrors | null) {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.formSubmitted ? standardValidator(control) : null;
    };
  }

  initForm(): void {
    this.formSubmitted = false;
    this.priceForm = this.fb.group({
      electricityPrice: [null, [this.conditionalValidator(Validators.required), this.conditionalValidator(Validators.min(0))]],
      waterPrice: [null, [this.conditionalValidator(Validators.required), this.conditionalValidator(Validators.min(0))]],
      servicePrice: [null, [this.conditionalValidator(Validators.required), this.conditionalValidator(Validators.min(0))]],
      roomPrice: [null, [this.conditionalValidator(Validators.required), this.conditionalValidator(Validators.min(0))]]
    });
  }

  ngOnInit(): void {
    this.loadPrices();
  }

  loadPrices(): void {
    this.loading = true;
    this.priceService.getPrices().subscribe({
      next: (data) => {
        this.prices = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading prices', error);
        this.snackBar.open('Không thể tải danh sách giá', 'Đóng', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    
    // Update validity of all controls since our conditional validators depend on formSubmitted
    Object.keys(this.priceForm.controls).forEach(key => {
      const control = this.priceForm.get(key);
      control?.updateValueAndValidity();
    });
    
    if (this.priceForm.invalid) {
      return;
    }

    this.isCreating = true;
    const newPrice: Price = this.priceForm.value;

    this.priceService.createPrice(newPrice).subscribe({
      next: () => {
        this.snackBar.open('Tạo giá mới thành công', 'Đóng', { duration: 3000 });
        this.loadPrices();
        // Use setTimeout to delay the form reset slightly
        setTimeout(() => {
          this.initForm();
        }, 0);
        this.isCreating = false;
      },
      error: (error) => {
        console.error('Error creating price', error);
        this.snackBar.open('Không thể tạo giá mới', 'Đóng', { duration: 3000 });
        this.isCreating = false;
      }
    });
  }

  resetForm(): void {
    this.initForm();
  }
} 