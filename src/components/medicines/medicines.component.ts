import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DataService, Medicine } from '../../services/data.service';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-medicines',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">My Medicines</h2>
        <button 
          (click)="showAddForm.set(true)"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-md flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New
        </button>
      </div>

      <!-- Grouped Medicine List -->
      <div class="flex-1 overflow-y-auto pr-1 pb-20">
        @if (dataService.medicines().length === 0) {
           <div class="flex flex-col items-center justify-center h-64 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <p>No medicines added yet.</p>
           </div>
        }

        @for (doctorEntry of dataService.groupedMedicines() | keyvalue; track doctorEntry.key) {
          <div class="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <!-- Doctor Header -->
            <div class="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="font-bold text-gray-700">{{ doctorEntry.key }}</span>
            </div>

            <!-- Conditions Group -->
            @for (conditionEntry of doctorEntry.value | keyvalue; track conditionEntry.key) {
              <div class="p-4">
                <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                   <span class="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                   {{ conditionEntry.key }}
                </h4>
                
                <div class="space-y-3">
                  @for (med of conditionEntry.value; track med.id) {
                    <div class="flex justify-between items-start p-3 rounded-lg border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                           <span class="font-semibold text-gray-800">{{ med.name }}</span>
                           
                           <!-- Actions Row -->
                           <div class="flex items-center gap-1">
                              @if (med.prescription) {
                                <button (click)="openPrescription(med)" class="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50" title="View Prescription">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                </button>
                              }
                              
                              <button (click)="openHistory(med)" class="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50" title="View History">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                           </div>
                        </div>
                        <div class="text-sm text-gray-500">{{ med.dosage }} • {{ med.time }}</div>
                        
                        <!-- AI Info Section -->
                        @if (selectedMedInfoId() === med.id) {
                           <div class="mt-2 p-3 bg-purple-50 text-xs text-purple-800 rounded-lg border border-purple-100 animate-fade-in relative">
                              <button (click)="selectedMedInfoId.set(null)" class="absolute top-1 right-2 text-purple-400 hover:text-purple-600">×</button>
                              @if (loadingInfo()) {
                                <div class="flex items-center gap-2">
                                  <div class="animate-spin h-3 w-3 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                                  Asking AI...
                                </div>
                              } @else {
                                {{ medInfoText() }}
                              }
                           </div>
                        } @else {
                           <button 
                             (click)="askAI(med)"
                             class="mt-2 text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                             What is this?
                           </button>
                        }
                      </div>
                      <button (click)="deleteMed(med.id)" class="text-gray-300 hover:text-red-500 transition-colors p-1 ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  }
                </div>
              </div>
              @if (!$last) { <div class="h-px bg-gray-100 mx-4"></div> }
            }
          </div>
        }
      </div>

      <!-- Add Medicine Modal -->
      @if (showAddForm()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div class="bg-blue-600 px-6 py-4 flex justify-between items-center shrink-0">
              <h3 class="text-white font-bold text-lg">Add Medicine</h3>
              <button (click)="closeForm()" class="text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form [formGroup]="addForm" (ngSubmit)="onSubmit()" class="p-6 space-y-4 overflow-y-auto">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                <input formControlName="name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="e.g. Aspirin">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                  <input formControlName="dosage" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 100mg">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input formControlName="time" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prescribing Doctor</label>
                <input formControlName="doctor" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Dr. Smith">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Condition / Reason</label>
                <input formControlName="condition" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Hypertension">
              </div>
              
              <!-- Prescription File Upload -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prescription (Optional)</label>
                <div class="flex items-center gap-2">
                  <label class="cursor-pointer bg-gray-50 border border-dashed border-gray-300 text-gray-600 px-3 py-3 rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2 text-sm w-full transition-colors">
                      @if (tempPrescription()) {
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                         <span class="truncate font-medium text-blue-600">{{ tempPrescription()?.name }}</span>
                      } @else {
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                         </svg>
                         <span>Upload Photo or PDF</span>
                      }
                      <input type="file" class="hidden" (change)="onFileSelected($event)" accept="image/*,application/pdf">
                  </label>
                  @if(tempPrescription()) {
                    <button type="button" (click)="tempPrescription.set(null)" class="text-red-500 hover:bg-red-50 p-3 rounded-lg border border-transparent hover:border-red-200 transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                       </svg>
                    </button>
                  }
                </div>
              </div>

              <div class="pt-4 flex gap-3">
                <button type="button" (click)="closeForm()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" [disabled]="!addForm.valid" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-200">Save Medicine</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Prescription View Modal -->
      @if (viewingPrescription()) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" (click)="closePrescription()">
           <div class="bg-white rounded-xl overflow-hidden max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl" (click)="$event.stopPropagation()">
              <div class="p-4 border-b flex justify-between items-center bg-gray-50">
                 <h3 class="font-bold text-gray-800 truncate pr-4">{{ viewingPrescription()?.name }}</h3>
                 <button (click)="closePrescription()" class="text-gray-500 hover:text-gray-800 p-1 bg-gray-200 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
              </div>
              <div class="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center">
                 @if (viewingPrescription()?.type?.startsWith('image')) {
                    <img [src]="safePrescriptionUrl" class="max-w-full h-auto rounded shadow-sm object-contain" alt="Prescription">
                 } @else {
                    <div class="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 max-w-sm">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                       </svg>
                       <p class="mb-2 text-gray-800 font-medium">Document Preview</p>
                       <p class="mb-6 text-gray-500 text-sm">This file ({{viewingPrescription()?.type}}) needs to be downloaded to view.</p>
                       <a [href]="safePrescriptionUrl" [download]="viewingPrescription()?.name" class="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors font-medium">
                         Download Document
                       </a>
                    </div>
                 }
              </div>
           </div>
        </div>
      }

      <!-- History View Modal -->
      @if (viewingHistory()) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" (click)="closeHistory()">
           <div class="bg-white rounded-xl overflow-hidden max-w-sm w-full max-h-[70vh] flex flex-col shadow-2xl animate-slide-up" (click)="$event.stopPropagation()">
              <div class="p-4 border-b flex justify-between items-center bg-gray-50">
                 <div>
                    <h3 class="font-bold text-gray-800">Intake History</h3>
                    <p class="text-xs text-gray-500">{{ viewingHistory()?.name }}</p>
                 </div>
                 <button (click)="closeHistory()" class="text-gray-500 hover:text-gray-800 p-1 bg-gray-200 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
              </div>
              
              <div class="flex-1 overflow-y-auto p-2">
                 @if (!viewingHistory()?.history?.length) {
                    <div class="py-10 text-center text-gray-400 text-sm">
                       No history recorded yet.
                    </div>
                 }

                 <div class="space-y-2">
                   @for (timestamp of getSortedHistory(viewingHistory()); track timestamp) {
                     <div class="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                       <div class="bg-green-100 p-2 rounded-full text-green-600">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                       </div>
                       <div>
                          <div class="text-sm font-semibold text-gray-700">{{ formatHistoryDate(timestamp) }}</div>
                          <div class="text-xs text-gray-400">{{ formatHistoryTime(timestamp) }}</div>
                       </div>
                     </div>
                   }
                 </div>
              </div>
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
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-in { animation: fade-in 0.2s ease-out; }
  `]
})
export class MedicinesComponent {
  dataService = inject(DataService);
  geminiService = inject(GeminiService);
  sanitizer = inject(DomSanitizer);
  fb: FormBuilder = inject(FormBuilder);

  showAddForm = signal(false);
  selectedMedInfoId = signal<string | null>(null);
  medInfoText = signal<string>('');
  loadingInfo = signal(false);
  
  // File Upload State
  tempPrescription = signal<{name: string, type: string, data: string} | null>(null);
  viewingPrescription = signal<{name: string, type: string, data: string} | null>(null);

  // History State
  viewingHistory = signal<Medicine | null>(null);

  addForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    dosage: ['', Validators.required],
    time: ['', Validators.required],
    doctor: ['', Validators.required],
    condition: ['', Validators.required]
  });

  closeForm() {
    this.showAddForm.set(false);
    this.addForm.reset();
    this.tempPrescription.set(null);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.tempPrescription.set({
          name: file.name,
          type: file.type,
          data: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.addForm.valid) {
      const medData = {
        ...this.addForm.value,
        prescription: this.tempPrescription()
      };
      this.dataService.addMedicine(medData);
      this.closeForm();
    }
  }

  deleteMed(id: string) {
    if(confirm('Are you sure you want to remove this medicine?')) {
      this.dataService.deleteMedicine(id);
    }
  }

  async askAI(med: Medicine) {
    this.selectedMedInfoId.set(med.id);
    this.loadingInfo.set(true);
    const info = await this.geminiService.getMedicineInfo(med.name);
    this.medInfoText.set(info);
    this.loadingInfo.set(false);
  }

  openPrescription(med: Medicine) {
    if (med.prescription) {
      this.viewingPrescription.set(med.prescription);
    }
  }

  closePrescription() {
    this.viewingPrescription.set(null);
  }

  get safePrescriptionUrl(): SafeResourceUrl | undefined {
    const p = this.viewingPrescription();
    return p ? this.sanitizer.bypassSecurityTrustResourceUrl(p.data) : undefined;
  }

  // History Logic
  openHistory(med: Medicine) {
    this.viewingHistory.set(med);
  }

  closeHistory() {
    this.viewingHistory.set(null);
  }

  getSortedHistory(med: Medicine | null): string[] {
    if (!med || !med.history) return [];
    return [...med.history].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }

  formatHistoryDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  formatHistoryTime(iso: string): string {
    return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
}