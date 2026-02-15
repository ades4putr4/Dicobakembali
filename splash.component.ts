import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-50 animate-fade-out">
      <div class="text-center animate-pulse-glow">
        <h1 class="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4 tracking-wider">
          DIMENSI TRADER
        </h1>
        <p class="text-sm font-semibold text-gray-500 tracking-[0.5em] mb-6">BY XHIVAS</p>
        
        <div class="h-0.5 w-24 bg-gray-700 mx-auto my-6"></div>
        <p class="text-gray-400 text-sm md:text-base font-light tracking-[0.2em] uppercase">
          Disiplin • Konsisten • Profit
        </p>
      </div>
      
      <div class="absolute bottom-10 text-gray-600 text-xs">
        Loading Assets...
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeOut {
      0% { opacity: 1; }
      90% { opacity: 1; }
      100% { opacity: 1; }
    }
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.8; transform: scale(1); text-shadow: 0 0 10px rgba(212, 175, 55, 0.3); }
      50% { opacity: 1; transform: scale(1.02); text-shadow: 0 0 20px rgba(212, 175, 55, 0.6); }
    }
    .animate-pulse-glow {
      animation: pulseGlow 3s infinite ease-in-out;
    }
  `]
})
export class SplashComponent {}