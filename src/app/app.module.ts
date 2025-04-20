import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Directive, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule, MAT_SELECT_CONFIG } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { ConfirmDialogModule } from './components/common/confirm-dialog/confirm-dialog.module';
import { EmptyStateModule } from './components/common/empty-state/empty-state.module';
import { OverlayModule, OverlayContainer, FullscreenOverlayContainer, Overlay, ScrollStrategyOptions } from '@angular/cdk/overlay';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { AccountFormDialogComponent } from './components/accounts/account-form-dialog/account-form-dialog.component';
import { RoomFormDialogComponent } from './components/rooms/room-form-dialog/room-form-dialog.component';
import { RoomsComponent } from './components/rooms/rooms.component';
import { StudentsModule } from './components/students/students.module';
import { NotificationsModule } from './components/notifications/notifications.module';
import { MaintenanceModule } from './components/maintenance/maintenance.module';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { RequestsComponent, RequestDetailDialogComponent, RequestFormDialogComponent, ResponseDialogComponent } from './components/requests/requests.component';
import { PricesComponent } from './components/prices/prices.component';
import { OrdersComponent } from './components/orders/orders.component';
import { PaymentResultComponent } from './components/payment-result/payment-result.component';

// Import interceptor
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NotificationDetailComponent } from './components/notifications/notification-detail/notification-detail.component';
import { SecurityComponent } from './components/security/security.component';
import { SecurityFormDialogComponent } from './components/security/security-form-dialog/security-form-dialog.component';

// Custom overlay scroll strategy factory
export function scrollStrategyFactory(overlay: Overlay) {
  return overlay.scrollStrategies.reposition();
}

// Fix select positioning directive
@Directive({
  selector: '[appFixSelectPosition]'
})
export class FixSelectPositionDirective implements AfterViewInit {
  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    // Add event listener to the select element
    this.elementRef.nativeElement.addEventListener('click', this.handleSelectClick.bind(this));
  }

  handleSelectClick() {
    // Wait for the overlay to be attached to the DOM
    setTimeout(() => {
      // Find all active overlay panes - need to be more specific to target the right one
      const overlayContainer = document.querySelector('.cdk-overlay-container');
      if (!overlayContainer) return;
      
      // Convert NodeList to Array to avoid TypeScript issues
      const overlayPanes = Array.from(overlayContainer.querySelectorAll('.cdk-overlay-pane'));
      if (overlayPanes.length === 0) return;
      
      // Get the last added overlay pane (most likely our select panel)
      // Find the one that contains mat-select-panel
      const targetPane = overlayPanes.find(pane => 
        pane.querySelector('.mat-mdc-select-panel') !== null
      );
      
      if (!targetPane) return;
      
      const selectTrigger = this.elementRef.nativeElement;
      const triggerRect = selectTrigger.getBoundingClientRect();
      
      // Position the panel immediately below the trigger with no gap
      this.renderer.setAttribute(targetPane, 'style', `
        position: absolute !important;
        top: ${triggerRect.bottom}px !important;
        left: ${triggerRect.left}px !important;
        width: ${triggerRect.width}px !important;
        min-width: ${triggerRect.width}px !important;
        max-width: ${triggerRect.width}px !important;
        transform: none !important;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
      `);

      // Force the panel itself to take full width
      const panel = targetPane.querySelector('.mat-mdc-select-panel');
      if (panel) {
        this.renderer.setAttribute(panel, 'style', `
          width: 100% !important;
          min-width: 100% !important;
          max-width: 100% !important;
          transform: none !important;
          position: relative !important;
        `);
      }
      
      // Style mat-option elements to be properly visible
      const options = Array.from(targetPane.querySelectorAll('mat-option'));
      options.forEach(option => {
        this.renderer.setAttribute(option, 'style', `
          padding: 10px 16px !important;
          height: auto !important;
          min-height: 48px !important;
          line-height: 1.4 !important;
          white-space: normal !important;
        `);
      });
    }, 50); // Increased timeout to ensure DOM is ready
  }
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LayoutComponent,
    HeaderComponent,
    NavbarComponent,
    AccountsComponent,
    AccountFormDialogComponent,
    RoomFormDialogComponent,
    RoomsComponent,
    NotFoundComponent,
    RequestsComponent,
    RequestDetailDialogComponent,
    RequestFormDialogComponent,
    ResponseDialogComponent,
    FixSelectPositionDirective,
    DashboardComponent,
    NotificationDetailComponent,
    SecurityComponent,
    SecurityFormDialogComponent,
    PricesComponent,
    OrdersComponent,
    PaymentResultComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    StudentsModule,
    NotificationsModule,
    MaintenanceModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatRippleModule,
    MatSortModule,
    MatCardModule,
    MatBadgeModule,
    MatDividerModule,
    ConfirmDialogModule,
    EmptyStateModule,
    OverlayModule
  ],
  providers: [
    // Đăng ký AuthInterceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    // Default dialog configuration
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        hasBackdrop: true,
        panelClass: 'custom-dialog-container',
        autoFocus: true,
        disableClose: false,
        backdropClass: 'custom-dialog-backdrop'
      }
    },
    // Use FullscreenOverlayContainer to fix accessibility issues
    {
      provide: OverlayContainer,
      useClass: FullscreenOverlayContainer
    },
    // Configure MatSelect to appear below the trigger element
    {
      provide: MAT_SELECT_CONFIG,
      useValue: { 
        overlayPanelClass: 'select-panel-class',
        disableOptionCentering: true 
      }
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
