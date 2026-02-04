import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService, TimeSlot } from '../api/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  // Form fields
  category = 'Cat 1';
  startTime: string = '';
  endTime: string = '';
  
  categories = ['Cat 1', 'Cat 2', 'Cat 3'];
  
  // All slots (for admin view)
  allSlots: TimeSlot[] = [];
  displayedColumns: string[] = ['id', 'category', 'start_time', 'end_time', 'status', 'user_id'];
  
  // Filter
  filterCategory: string = '';
  
  private refreshSub?: Subscription;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🔧 Admin panel initialized');
    this.loadAllSlots();
    
    // Subscribe to refresh events
    this.refreshSub = this.api.refresh$.subscribe(() => {
      console.log('🔄 Refresh triggered in admin');
      this.loadAllSlots();
    });
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }

  /**
   * Load all slots (optionally filtered by category)
   */
  loadAllSlots() {
    const startDate = '2026-02-02';
    
    console.log('📥 Loading ALL slots from database');
    console.log('   Filter category:', this.filterCategory || 'None (all categories)');
    console.log('   Start date:', startDate);
    
    this.api.getSlots(startDate, this.filterCategory || undefined).subscribe({
      next: (slots) => {
        console.log('✅ Received slots from API:', slots.length);
        console.log('📊 Full slots data:', slots);
        
        if (slots.length > 0) {
          console.log('   Sample slot:', slots[0]);
          console.log('   Sample slot keys:', Object.keys(slots[0]));
          console.log('   Categories found:', [...new Set(slots.map(s => s.category))]);
        } else {
          console.log('   ⚠️ No slots returned from API');
        }
        
        // Sort by most recent first
        this.allSlots = slots.sort((a, b) => 
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );
        
        console.log('   ✅ allSlots updated:', this.allSlots.length);
        console.log('   First slot in allSlots:', this.allSlots[0]);
        
        this.cdr.detectChanges();
        
        setTimeout(() => {
          console.log('   🔍 Checking after timeout:');
          console.log('   allSlots.length:', this.allSlots.length);
          console.log('   allSlots array:', this.allSlots);
        }, 100);
      },
      error: (err) => {
        console.error('❌ Error loading admin slots:', err);
        console.error('   Error object:', err);
        console.error('   Error message:', err.message);
        this.allSlots = [];
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Apply category filter
   */
  applyFilter() {
    console.log('🔍 Applying filter:', this.filterCategory);
    this.loadAllSlots();
  }

  /**
   * Clear filter
   */
  clearFilter() {
    console.log('🧹 Clearing filter');
    this.filterCategory = '';
    this.loadAllSlots();
  }

  /**
   * Add new time slot - FIXED: Proper timezone handling
   */
  addSlot() {
    console.log('🔵 Add slot clicked');
    console.log('   Category:', this.category);
    console.log('   Start Time (input):', this.startTime);
    console.log('   End Time (input):', this.endTime);
    
    if (!this.startTime || !this.endTime) {
      alert('Please select both start and end times');
      return;
    }

    // FIXED: Parse datetime-local as local time, not UTC
    // The datetime-local input gives us a string like "2026-02-04T10:00"
    // We need to preserve this as the actual time, not convert it to UTC
    const start = new Date(this.startTime);
    const end = new Date(this.endTime);
    
    console.log('   Start Time (parsed):', start);
    console.log('   End Time (parsed):', end);
    
    if (end <= start) {
      alert('End time must be after start time');
      return;
    }

    // FIXED: Format as ISO string but preserve the local time
    // Instead of using toISOString() which converts to UTC,
    // we manually construct the ISO string with local time
    const payload: Partial<TimeSlot> = {
      category: this.category,
      start_time: this.formatLocalAsISO(start),
      end_time: this.formatLocalAsISO(end)
    };
    
    console.log('📤 Sending payload to API:', payload);
    console.log('   Start time being sent:', payload.start_time);
    console.log('   End time being sent:', payload.end_time);

    this.api.createSlot(payload).subscribe({
      next: (res) => {
        console.log('✅ Slot created successfully:', res);
        
        // Clear form
        this.startTime = '';
        this.endTime = '';
        
        // Show success message
        alert(`Time slot created successfully!\nID: ${res.id}\nCategory: ${res.category}`);
        
        // Reload slots
        setTimeout(() => this.loadAllSlots(), 500);
      },
      error: (err) => {
        console.error('❌ Error creating slot:', err);
        console.error('   Error response:', err.error);
        console.error('   Status:', err.status);
        alert(`Failed to create time slot.\nError: ${err.error?.detail || err.message}`);
      }
    });
  }

  /**
   * FIXED: Format date as ISO string but keep local time instead of converting to UTC
   * This prevents the timezone shift issue
   */
  private formatLocalAsISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    // Return ISO format with local time (without timezone offset)
    // If your backend expects UTC, you may need to append 'Z'
    // For now, sending without 'Z' to preserve local time
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * Get status display for a slot
   */
  getSlotStatus(slot: TimeSlot): string {
    return slot.user_id ? 'Booked' : 'Available';
  }

  /**
   * Check if slot is in the past
   */
  isPastSlot(slot: TimeSlot): boolean {
    return new Date(slot.end_time) < new Date();
  }

  /**
   * Set form to current date/time
   */
  setToNow() {
    const now = new Date();
    this.startTime = this.formatDateTimeLocal(now);
    
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    this.endTime = this.formatDateTimeLocal(oneHourLater);
    
    console.log('⏰ Set to now');
    console.log('   Start:', this.startTime);
    console.log('   End:', this.endTime);
  }

  /**
   * Format date for datetime-local input
   */
  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Get count of booked slots
   */
  getBookedCount(): number {
    return this.allSlots.filter(slot => slot.user_id !== null && slot.user_id !== undefined).length;
  }

  /**
   * Get count of available slots
   */
  getAvailableCount(): number {
    return this.allSlots.filter(slot => !slot.user_id).length;
  }

  /**
   * Format date/time for display in the table
   */
  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}