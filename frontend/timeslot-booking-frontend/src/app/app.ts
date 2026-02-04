import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <span class="app-title">
        <mat-icon>event</mat-icon>
        Time Slot Booking System
      </span>
      
      <span class="spacer"></span>
      
      <nav class="nav-links">
        <a mat-button routerLink="/calendar" routerLinkActive="active">
          <mat-icon>calendar_month</mat-icon>
          Calendar
        </a>
        <a mat-button routerLink="/preferences" routerLinkActive="active">
          <mat-icon>settings</mat-icon>
          Preferences
        </a>
        <a mat-button routerLink="/admin" routerLinkActive="active">
          <mat-icon>admin_panel_settings</mat-icon>
          Admin
        </a>
      </nav>
    </mat-toolbar>
    
    <div class="app-content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .app-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 500;
    }
    
    .spacer {
      flex: 1;
    }
    
    .nav-links {
      display: flex;
      gap: 8px;
    }
    
    .nav-links a {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .nav-links a.active {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .app-content {
      min-height: calc(100vh - 64px);
      background: #f5f5f5;
    }
    
    @media (max-width: 768px) {
      .app-title {
        font-size: 16px;
      }
      
      .nav-links a mat-icon {
        margin-right: 0;
      }
      
      .nav-links a span {
        display: none;
      }
    }
  `]
})
export class AppComponent {
  title = 'Time Slot Booking';
}
