import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Medicine } from '../../services/data.service';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Welcome Section -->
      <header class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 class="text-2xl font-bold mb-2">Hello, Patient</h2>
        <p class="opacity-90">Here is your health overview for today.</p>
        
        <div class="mt-6 flex flex-wrap gap-4">
          <div class="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex-1 min-w-[140px]">
            <div class="text-3xl font-bold">{{ progress() }}%</div>
            <div class="text-sm opacity-80">Daily Adherence</div>
          </div>
          <div class="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex-1 min-w-[140px]">
            <div class="text-3xl font-bold">{{ upcomingCount() }}</div>
            <div class="text-sm opacity-80">Upcoming Appts</div>
          </div>
        </div>
      </header>

      <!-- AI Insight Section -->
      <section class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-semibold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Health Insight
          </h3>
          <button 
            (click)="generateInsight()"
            [disabled]="isLoading()"
            class="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors disabled:opacity-50">
            {{ isLoading() ? 'Thinking...' : 'Refresh Insight' }}
          </button>
        </div>
        
        @if (aiInsight()) {
          <p class="text-sm text-gray-600 leading-relaxed bg-purple-50 p-3 rounded-lg border border-purple-100 animate-fade-in">
            {{ aiInsight() }}
          </p>
        } @else {
          <div class="text-center py-4 text-gray-400 text-sm">
            Tap 'Refresh Insight' to get AI analysis of your medicine schedule.
          </div>
        }
      </section>

      <!-- Today's Timeline -->
      <section>
        <h3 class="font-bold text-gray-800 text-lg mb-4">Today's Schedule</h3>
        <div class="space-y-3">
          @if (todayMedicines().length === 0) {
             <div class="text-center py-8 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                No medicines scheduled for today.
             </div>
          }

          @for (med of todayMedicines(); track med.id) {
            <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 flex justify-between items-center group transition-all hover:shadow-md"
                 [class.border-l-green-500]="isTakenToday(med)"
                 [class.border-l-blue-500]="!isTakenToday(med)">
              
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-gray-800">{{ med.name }}</span>
                  <span class="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{{ med.dosage }}</span>
                </div>
                <div class="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ med.time }}
                </div>
              </div>

              <button 
                (click)="toggleTaken(med.id)"
                class="h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                [class.bg-green-100]="isTakenToday(med)"
                [class.text-green-600]="isTakenToday(med)"
                [class.bg-gray-100]="!isTakenToday(med)"
                [class.text-gray-400]="!isTakenToday(med)"
                [class.hover:bg-gray-200]="!isTakenToday(med)">
                @if (isTakenToday(med)) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                }
              </button>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 0.3s ease-out; }
  `]
})
export class DashboardComponent {
  dataService = inject(DataService);
  geminiService = inject(GeminiService);

  todayMedicines = computed(() => {
    return this.dataService.medicines().sort((a, b) => a.time.localeCompare(b.time));
  });

  upcomingCount = computed(() => this.dataService.appointments().length);
  
  progress = computed(() => {
    const meds = this.todayMedicines();
    if (meds.length === 0) return 100;
    const taken = meds.filter(m => this.isTakenToday(m)).length;
    return Math.round((taken / meds.length) * 100);
  });

  aiInsight = signal<string>('');
  isLoading = signal<boolean>(false);

  toggleTaken(id: string) {
    this.dataService.toggleTaken(id);
  }

  isTakenToday(med: Medicine): boolean {
    const today = new Date().toDateString();
    return med.history.some(dateStr => new Date(dateStr).toDateString() === today);
  }

  async generateInsight() {
    this.isLoading.set(true);
    const text = await this.geminiService.analyzeSchedule(this.dataService.medicines());
    this.aiInsight.set(text);
    this.isLoading.set(false);
  }
}