import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MedicinesComponent } from './components/medicines/medicines.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';

export type ViewState = 'dashboard' | 'medicines' | 'appointments';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardComponent, 
    MedicinesComponent, 
    AppointmentsComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  currentView = signal<ViewState>('dashboard');
}