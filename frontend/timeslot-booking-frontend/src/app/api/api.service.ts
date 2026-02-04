import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface TimeSlot {
  id?: number;
  category: string;
  start_time: string;
  end_time: string;
  user_id?: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = 'http://127.0.0.1:8000';
  
  // Use BehaviorSubject to trigger refreshes across components
  refresh$ = new BehaviorSubject<void>(undefined);
  
  // Store selected category
  selectedCategory$ = new BehaviorSubject<string>('Cat 1');

  constructor(private http: HttpClient) {}

  /**
   * Get time slots for a specific week and optional category
   */
  getSlots(weekStart: string, category?: string): Observable<TimeSlot[]> {
    let url = `${this.base}/slots/?week_start=${encodeURIComponent(weekStart)}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    console.log('🌐 GET:', url);
    return this.http.get<TimeSlot[]>(url).pipe(
      tap(res => console.log('✅ Received slots:', res.length))
    );
  }

  /**
   * Create a new time slot (admin only)
   */
  createSlot(slot: Partial<TimeSlot>): Observable<TimeSlot> {
    console.log('🌐 POST:', `${this.base}/slots/`, slot);
    return this.http.post<TimeSlot>(`${this.base}/slots/`, slot).pipe(
      tap(res => {
        console.log('✅ Slot created:', res);
        this.refresh$.next(); // Trigger refresh
      })
    );
  }

  /**
   * Sign up for a time slot
   */
  signup(slotId: number, userId: number): Observable<any> {
    console.log(`🌐 POST: Signup for slot ${slotId} by user ${userId}`);
    return this.http.post(`${this.base}/slots/${slotId}/signup/${userId}`, {}).pipe(
      tap(() => {
        console.log('✅ Signed up successfully');
        this.refresh$.next(); // Trigger refresh
      })
    );
  }

  /**
   * Unsubscribe from a time slot
   */
  unsubscribe(slotId: number): Observable<any> {
    console.log(`🌐 POST: Unsubscribe from slot ${slotId}`);
    return this.http.post(`${this.base}/slots/${slotId}/unsubscribe`, {}).pipe(
      tap(() => {
        console.log('✅ Unsubscribed successfully');
        this.refresh$.next(); // Trigger refresh
      })
    );
  }

  /**
   * Update selected category
   */
  setCategory(category: string): void {
    this.selectedCategory$.next(category);
  }
}
