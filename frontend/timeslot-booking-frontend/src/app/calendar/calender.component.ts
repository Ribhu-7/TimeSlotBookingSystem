import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService, TimeSlot } from '../api/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, OnDestroy {
  slots: TimeSlot[] = [];
  currentWeekStart!: Date;
  selectedCategory: string = 'Cat 1';
  currentUserId = 1;
  
  private refreshSub?: Subscription;
  private categorySub?: Subscription;
  private isInitialized = false;
  private loadingSlots = false;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('📅 Calendar initialized');
    
    // Initialize to current week FIRST
    this.currentWeekStart = this.getWeekStartDate(new Date());
    
    // Subscribe to category changes (will trigger immediately with current value)
    this.categorySub = this.api.selectedCategory$.subscribe(category => {
      console.log('📋 Category updated to:', category);
      this.selectedCategory = category;
      
      // Only reload if we're already initialized (skip first emission)
      if (this.isInitialized) {
        this.loadSlots();
      }
    });
    
    // Subscribe to refresh events (will trigger immediately with undefined)
    this.refreshSub = this.api.refresh$.subscribe(() => {
      console.log('🔄 Refresh triggered');
      
      // Only reload if we're already initialized (skip first emission)
      if (this.isInitialized) {
        this.loadSlots();
      }
    });
    
    // Now mark as initialized and do the initial load
    this.isInitialized = true;
    this.loadSlots();
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
    this.categorySub?.unsubscribe();
  }

  /**
   * TrackBy function for *ngFor to prevent DOM reuse
   * CRITICAL: This ensures Angular creates new DOM elements for each slot
   */
  trackBySlotId(index: number, slot: TimeSlot): any {
    return slot.id || index;
  }

  /**
   * Get Monday of the week for any given date
   * Returns a Date object set to Monday at 00:00:00 in LOCAL timezone
   */
  private getWeekStartDate(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Get the end date of current week (Sunday 23:59:59)
   */
  private getWeekEndDate(): Date {
    const weekEnd = new Date(this.currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  }

  /**
   * Load slots for current week and selected category
   */
  loadSlots() {
    // Prevent concurrent loads
    if (this.loadingSlots) {
      console.log('⚠️ Already loading slots, skipping duplicate request');
      return;
    }
    
    this.loadingSlots = true;
    
    // CRITICAL: Clear slots immediately to prevent showing stale data
    this.slots = [];
    this.cdr.detectChanges(); // Force UI update
    
    const weekStartStr = this.formatDateForAPI(this.currentWeekStart);
    
    console.log('═══════════════════════════════════════');
    console.log('📥 LOADING SLOTS');
    console.log('═══════════════════════════════════════');
    console.log('Week Start for API:', weekStartStr);
    console.log('Week Range Display:', this.getWeekRange());
    console.log('Category:', this.selectedCategory);
    console.log('Full API URL: /slots/?week_start=' + weekStartStr + '&category=' + encodeURIComponent(this.selectedCategory));
    console.log('═══════════════════════════════════════');
    
    this.api.getSlots(weekStartStr, this.selectedCategory).subscribe({
      next: (slots) => {
        console.log('═══════════════════════════════════════');
        console.log('✅ RECEIVED SLOTS FROM API');
        console.log('═══════════════════════════════════════');
        console.log('Total slots received:', slots.length);
        console.log('Week being displayed:', this.getWeekRange());
        
        // Log each slot received
        slots.forEach((slot, index) => {
          const slotDate = new Date(slot.start_time);
          console.log(`Slot ${index + 1}:`, {
            id: slot.id,
            start_time: slot.start_time,
            start_date: slotDate.toLocaleDateString(),
            user_id: slot.user_id
          });
        });
        
        // CRITICAL: Create NEW array (don't mutate existing)
        const sortedSlots = [...slots].sort((a, b) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        
        // Assign new array to trigger change detection
        this.slots = sortedSlots;
        
        console.log('═══════════════════════════════════════');
        console.log('📊 FINAL DISPLAY');
        console.log('═══════════════════════════════════════');
        console.log('Total slots to display:', this.slots.length);
        if (this.slots.length > 0) {
          console.log('First slot:', this.slots[0].start_time);
          console.log('Last slot:', this.slots[this.slots.length - 1].start_time);
        }
        console.log('═══════════════════════════════════════');
        
        this.loadingSlots = false;
        this.cdr.detectChanges(); // Force UI update
      },
      error: (err) => {
        console.error('═══════════════════════════════════════');
        console.error('❌ ERROR LOADING SLOTS');
        console.error('═══════════════════════════════════════');
        console.error('Error:', err);
        console.error('═══════════════════════════════════════');
        this.slots = [];
        this.loadingSlots = false;
        this.cdr.detectChanges(); // Force UI update
      }
    });
  }

  /**
   * Navigate to previous week
   */
  previousWeek() {
    console.log('\n⬅️ PREVIOUS WEEK CLICKED');
    
    const newWeekStart = new Date(this.currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    this.currentWeekStart = newWeekStart;
    
    console.log('New week:', this.getWeekRange());
    
    this.loadSlots();
  }

  /**
   * Navigate to next week
   */
  nextWeek() {
    console.log('\n➡️ NEXT WEEK CLICKED');
    
    const newWeekStart = new Date(this.currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    this.currentWeekStart = newWeekStart;
    
    console.log('New week:', this.getWeekRange());
    
    this.loadSlots();
  }

  /**
   * Go to current week
   */
  goToCurrentWeek() {
    console.log('\n🎯 TODAY BUTTON CLICKED');
    const today = new Date();
    
    this.currentWeekStart = this.getWeekStartDate(today);
    
    console.log('Going to week:', this.getWeekRange());
    
    this.loadSlots();
  }

  /**
   * Sign up for a time slot
   */
  signup(slot: TimeSlot) {
    if (!slot.id) {
      console.error('❌ Cannot sign up: slot has no ID');
      return;
    }
    
    console.log('✏️ Signing up for slot:', slot.id);
    
    this.api.signup(slot.id, this.currentUserId).subscribe({
      next: () => {
        console.log('✅ Signed up successfully');
      },
      error: (err) => {
        console.error('❌ Error signing up:', err);
        alert('Failed to sign up. The slot may already be taken.');
      }
    });
  }

  /**
   * Unsubscribe from a time slot
   */
  unsubscribe(slot: TimeSlot) {
    if (!slot.id) {
      console.error('❌ Cannot unsubscribe: slot has no ID');
      return;
    }
    
    console.log('🚫 Unsubscribing from slot:', slot.id);
    
    this.api.unsubscribe(slot.id).subscribe({
      next: () => {
        console.log('✅ Unsubscribed successfully');
      },
      error: (err) => {
        console.error('❌ Error unsubscribing:', err);
        alert('Failed to unsubscribe. Please try again.');
      }
    });
  }

  /**
   * Check if user is signed up for this slot
   */
  isSignedUp(slot: TimeSlot): boolean {
    return slot.user_id === this.currentUserId;
  }

  /**
   * Check if slot is available for signup
   */
  isAvailable(slot: TimeSlot): boolean {
    return !slot.user_id;
  }

  /**
   * Get the week range display string
   */
  getWeekRange(): string {
    const weekEnd = this.getWeekEndDate();
    return `${this.formatDateDisplay(this.currentWeekStart)} - ${this.formatDateDisplay(weekEnd)}`;
  }

  /**
   * Format date for API (YYYY-MM-DD)
   * Uses LOCAL timezone (not UTC)
   */
  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format date for display (MMM DD, YYYY)
   */
  private formatDateDisplay(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  /**
   * Check if viewing current week
   */
  isCurrentWeek(): boolean {
    const today = this.getWeekStartDate(new Date());
    const todayStr = this.formatDateForAPI(today);
    const currentStr = this.formatDateForAPI(this.currentWeekStart);
    return todayStr === currentStr;
  }
}