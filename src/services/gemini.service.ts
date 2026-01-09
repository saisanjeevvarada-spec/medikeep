import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  async getMedicineInfo(medicineName: string): Promise<string> {
    try {
      const prompt = `Provide a very brief summary (max 3 sentences) of what the medicine "${medicineName}" is typically used for and one common side effect. Keep it simple for a patient.`;
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return 'Unable to fetch medicine information at this time.';
    }
  }

  async analyzeSchedule(medicines: any[]): Promise<string> {
    try {
      const medsList = medicines.map(m => `${m.name} (${m.dosage}) for ${m.condition}`).join(', ');
      const prompt = `I am taking the following medicines: ${medsList}. Are there any general lifestyle tips or common interactions I should be generally aware of? Keep it friendly, encouraging, and brief (max 100 words). Format as a nice paragraph.`;
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return 'AI analysis currently unavailable.';
    }
  }
}