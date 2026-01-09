import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Appointments</h2>
        <button 
          (click)="showAddForm.set(true)"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-md flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>

      <div class="flex-1 overflow-y-auto space-y-4 pb-20">
        @if (dataService.upcomingAppointments().length === 0) {
           <div class="flex flex-col items-center justify-center h-64 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No upcoming appointments.</p>
           </div>
        }

        @for (apt of dataService.upcomingAppointments(); track apt.id) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative group overflow-hidden">
             <!-- Decorative side bar -->
             <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>

             <div class="flex justify-between items-start mb-2">
               <div>
                 <h3 class="font-bold text-lg text-gray-800">{{ apt.doctor }}</h3>
                 <span class="text-indigo-600 text-sm font-medium bg-indigo-50 px-2 py-0.5 rounded">{{ apt.reason }}</span>
               </div>
               <button (click)="deleteApt(apt.id)" class="text-gray-300 hover:text-red-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
             </div>

             <div class="flex items-center gap-4 text-gray-600 mt-2">
               <div class="flex items-center gap-1.5">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                 {{ apt.date }}
               </div>
               <div class="flex items-center gap-1.5">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 {{ apt.time }}
               </div>
             </div>
          </div>
        }
      </div>

      <!-- Add Appointment Modal -->
      @if (showAddForm()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
            <div class="bg-indigo-600 px-6 py-4 flex justify-between items-center">
              <h3 class="text-white font-bold text-lg">New Appointment</h3>
              <button (click)="closeForm()" class="text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form [formGroup]="addForm" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                <input formControlName="doctor" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Dr. Jones">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                <input formControlName="reason" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Annual Checkup">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input formControlName="date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input formControlName="time" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
              </div>

              <div class="pt-4 flex gap-3">
                <button type="button" (click)="closeForm()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" [disabled]="!addForm.valid" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-indigo-200">Save</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  `]
})
export class AppointmentsComponent {
  dataService = inject(DataService);
  fb: FormBuilder = inject(FormBuilder);
  showAddForm = signal(false);

  addForm: FormGroup = this.fb.group({
    doctor: ['', Validators.required],
    reason: ['', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required]
  });

  closeForm() {
    this.showAddForm.set(false);
    this.addForm.reset();
  }

  onSubmit() {
    if (this.addForm.valid) {
      this.dataService.addAppointment(this.addForm.value);
      this.closeForm();
    }
  }

  deleteApt(id: string) {
    if(confirm('Cancel this appointment?')) {
      this.dataService.deleteAppointment(id);
    }
  }
}