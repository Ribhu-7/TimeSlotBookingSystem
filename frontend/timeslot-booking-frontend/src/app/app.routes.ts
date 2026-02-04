import { Routes } from '@angular/router';
import { CalendarComponent } from './calendar/calender.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
  { path: '', redirectTo: '/calendar', pathMatch: 'full' },
  { path: 'calendar', component: CalendarComponent },
  { path: 'preferences', component: PreferencesComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '/calendar' }
];
