import { Injectable, signal, computed } from '@angular/core';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string; // HH:mm format
  doctor: string;
  condition: string;
  history: string[]; // Array of ISO timestamps
  prescription?: {
    name: string;
    type: string;
    data: string; // base64 string
  };
}

export interface Appointment {
  id: string;
  doctor: string;
  date: string; // YYYY-MM-DD
  time: string;
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Initial dummy data for better UX on load
  private initialMedicines: Medicine[] = [
    { id: '1', name: 'Lisinopril', dosage: '10mg', time: '08:00', doctor: 'Dr. Smith', condition: 'Hypertension', history: [] },
    { id: '2', name: 'Metformin', dosage: '500mg', time: '09:00', doctor: 'Dr. Jones', condition: 'Diabetes', history: [new Date().toISOString()] }, // Simulating taken today
    { id: '3', name: 'Amlodipine', dosage: '5mg', time: '20:00', doctor: 'Dr. Smith', condition: 'Hypertension', history: [] },
    { id: '4', name: 'Vitamin D', dosage: '2000IU', time: '08:00', doctor: 'Dr. Doe', condition: 'General Health', history: [] },
  ];

  private initialAppointments: Appointment[] = [
    { id: '1', doctor: 'Dr. Smith', date: '2024-11-15', time: '10:00', reason: 'Blood Pressure Check' },
    { id: '2', doctor: 'Dr. Jones', date: '2024-11-20', time: '14:30', reason: 'A1C Follow-up' },
  ];

  medicines = signal<Medicine[]>(this.initialMedicines);
  appointments = signal<Appointment[]>(this.initialAppointments);

  constructor() {
    // In a real app, we would load from localStorage here
  }

  addMedicine(med: Omit<Medicine, 'id' | 'history'>) {
    const newMed: Medicine = {
      ...med,
      id: crypto.randomUUID(),
      history: []
    };
    this.medicines.update(meds => [...meds, newMed]);
  }

  toggleTaken(id: string) {
    const now = new Date();
    const todayStr = now.toDateString();

    this.medicines.update(meds => 
      meds.map(m => {
        if (m.id === id) {
          // Check if taken today based on history
          const takenIndex = m.history.findIndex(h => new Date(h).toDateString() === todayStr);
          
          let newHistory = [...m.history];
          if (takenIndex > -1) {
            // Determine "untake" - remove today's entry
            newHistory.splice(takenIndex, 1);
          } else {
            // Take - add timestamp
            newHistory.push(now.toISOString());
          }
          return { ...m, history: newHistory };
        }
        return m;
      })
    );
  }

  deleteMedicine(id: string) {
    this.medicines.update(meds => meds.filter(m => m.id !== id));
  }

  addAppointment(apt: Omit<Appointment, 'id'>) {
    const newApt: Appointment = {
      ...apt,
      id: crypto.randomUUID()
    };
    this.appointments.update(apts => [...apts, newApt]);
  }

  deleteAppointment(id: string) {
    this.appointments.update(apts => apts.filter(a => a.id !== id));
  }

  // Computed properties for grouping
  // Returns Map<DoctorName, Map<Condition, Medicine[]>>
  groupedMedicines = computed(() => {
    const meds = this.medicines();
    const groups = new Map<string, Map<string, Medicine[]>>();

    meds.forEach(med => {
      if (!groups.has(med.doctor)) {
        groups.set(med.doctor, new Map<string, Medicine[]>());
      }
      const docGroup = groups.get(med.doctor)!;
      
      if (!docGroup.has(med.condition)) {
        docGroup.set(med.condition, []);
      }
      docGroup.get(med.condition)!.push(med);
    });

    // Sort lists by time
    groups.forEach(docMap => {
      docMap.forEach(medList => {
        medList.sort((a, b) => a.time.localeCompare(b.time));
      });
    });

    return groups;
  });

  upcomingAppointments = computed(() => {
    return this.appointments().sort((a, b) => {
      return (a.date + a.time).localeCompare(b.date + b.time);
    });
  });
}