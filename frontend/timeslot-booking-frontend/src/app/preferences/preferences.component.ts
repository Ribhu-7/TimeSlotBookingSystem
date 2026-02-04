import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApiService } from '../api/api.service';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.css']
})
export class PreferencesComponent implements OnInit {
  category: string = 'Cat 1';
  
  categories = ['Cat 1', 'Cat 2', 'Cat 3'];

  constructor(private api: ApiService) {}

  ngOnInit() {
    // Load saved preference from localStorage
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
      this.category = savedCategory;
    }
    this.api.setCategory(this.category);
  }

  onCategoryChange() {
    console.log('📋 Category changed to:', this.category);
    // Save to localStorage
    localStorage.setItem('selectedCategory', this.category);
    // Update API service
    this.api.setCategory(this.category);
    // Trigger refresh of calendar
    this.api.refresh$.next();
  }
}
