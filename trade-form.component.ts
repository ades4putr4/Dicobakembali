import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DataService, Trade } from '../services/data.service';

@Component({
  selector: 'app-trade-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6 pt-2">
      <!-- Header -->
      <div class="flex items-center justify-between mb-2">
        <div>
          <h2 class="text-xl font-bold text-white">{{ dataService.t().form_title }}</h2>
          <p class="text-xs text-gray-500">{{ dataService.t().form_subtitle }}</p>
        </div>
        <div class="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
          <!-- Custom Icon: Strategy / Draft -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="saveTrade()" class="space-y-5">
        
        <!-- Type Selector (Segmented Control) -->
        <div class="p-1 bg-[#151515] rounded-xl border border-white/5 flex relative">
          <div class="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gray-800 rounded-lg shadow-sm transition-all duration-300 ease-out"
               [class.translate-x-0]="form.get('type')?.value === 'BUY'"
               [class.translate-x-full]="form.get('type')?.value === 'SELL'"
               [class.bg-green-600]="form.get('type')?.value === 'BUY'"
               [class.bg-red-600]="form.get('type')?.value === 'SELL'"
               [class.left-1]="true"></div>
               
          <button type="button" (click)="setType('BUY')" 
            class="flex-1 py-3 text-sm font-bold z-10 transition-colors relative"
            [class.text-white]="form.get('type')?.value === 'BUY'"
            [class.text-gray-500]="form.get('type')?.value !== 'BUY'">
            BUY
          </button>
          <button type="button" (click)="setType('SELL')"
            class="flex-1 py-3 text-sm font-bold z-10 transition-colors relative"
            [class.text-white]="form.get('type')?.value === 'SELL'"
            [class.text-gray-500]="form.get('type')?.value !== 'SELL'">
            SELL
          </button>
        </div>

        <!-- Pair Input -->
        <div class="space-y-1">
          <label class="text-[10px] font-medium text-gray-500 uppercase tracking-wider ml-1">{{ dataService.t().form_pair }}</label>
          <input type="text" formControlName="pair" placeholder="ex. XAUUSD" 
            class="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-semibold tracking-wide placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all uppercase">
        </div>

        <!-- Price Grid -->
        <div class="grid grid-cols-3 gap-3">
          <div class="space-y-1">
            <label class="text-[10px] font-medium text-gray-500 uppercase tracking-wider ml-1">{{ dataService.t().form_entry }}</label>
            <input type="number" formControlName="entry" placeholder="0.0" step="any"
              class="w-full bg-[#151515] border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500">
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-medium text-red-500/70 uppercase tracking-wider ml-1">{{ dataService.t().form_sl }}</label>
            <input type="number" formControlName="sl" placeholder="0.0" step="any"
              class="w-full bg-[#151515] border border-red-900/30 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-red-500">
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-medium text-green-500/70 uppercase tracking-wider ml-1">{{ dataService.t().form_tp }}</label>
            <input type="number" formControlName="tp" placeholder="0.0" step="any"
              class="w-full bg-[#151515] border border-green-900/30 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-green-500">
          </div>
        </div>

        <!-- Money Management Card -->
        <div class="glass-panel p-4 rounded-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 class="text-xs font-semibold text-amber-500 uppercase tracking-wider">{{ dataService.t().form_mm }}</h3>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[10px] text-gray-500 uppercase">{{ dataService.t().form_bal }}</label>
              <input type="number" formControlName="capital" class="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none">
            </div>
            <div class="space-y-1">
              <label class="text-[10px] text-gray-500 uppercase">{{ dataService.t().form_risk }}</label>
              <input type="number" formControlName="riskPercent" class="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none">
            </div>
          </div>

          <!-- Summary Chips -->
          <div class="grid grid-cols-3 gap-2">
             <div class="bg-[#0a0a0a] rounded-lg p-2 text-center border border-white/5">
                <span class="block text-[8px] text-gray-500 uppercase mb-1">{{ dataService.t().form_summary_risk }}</span>
                <span class="text-sm font-bold text-red-400">{{ riskAmount | currency:'USD':'symbol':'1.0-0' }}</span>
             </div>
             <div class="bg-[#0a0a0a] rounded-lg p-2 text-center border border-white/5">
                <span class="block text-[8px] text-gray-500 uppercase mb-1">{{ dataService.t().form_summary_ratio }}</span>
                <span class="text-sm font-bold text-blue-400">1:{{ rrRatio | number:'1.1-1' }}</span>
             </div>
             <div class="bg-[#0a0a0a] rounded-lg p-2 text-center border border-white/5">
                <span class="block text-[8px] text-gray-500 uppercase mb-1">{{ dataService.t().form_summary_size }}</span>
                <span class="text-sm font-bold text-amber-500">{{ lotSize | number:'1.2-2' }}</span>
             </div>
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-medium text-gray-500 uppercase tracking-wider ml-1">{{ dataService.t().form_notes }}</label>
          <textarea formControlName="notes" rows="2" class="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-amber-500 placeholder-gray-700" placeholder="Trading setup details..."></textarea>
        </div>

        <button type="submit" [disabled]="form.invalid"
          class="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-4 rounded-xl shadow-lg shadow-amber-500/20 transform transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
          {{ dataService.t().form_btn }}
        </button>
      </form>
    </div>
  `
})
export class TradeFormComponent {
  private fb: FormBuilder = inject(FormBuilder);
  dataService = inject(DataService);
  viewChange = output<'dashboard' | 'plan' | 'journal'>();

  form: FormGroup = this.fb.group({
    pair: ['', Validators.required],
    type: ['BUY', Validators.required],
    entry: [null as number | null, Validators.required],
    sl: [null as number | null, Validators.required],
    tp: [null as number | null, Validators.required],
    capital: [1000, Validators.required],
    riskPercent: [1, Validators.required],
    notes: ['']
  });

  get riskAmount(): number {
    const capital = this.form.get('capital')?.value || 0;
    const risk = this.form.get('riskPercent')?.value || 0;
    return (capital * risk) / 100;
  }

  get rrRatio(): number {
    const entry = this.form.get('entry')?.value || 0;
    const sl = this.form.get('sl')?.value || 0;
    const tp = this.form.get('tp')?.value || 0;
    
    if (!entry || !sl || !tp) return 0;
    
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    
    if (risk === 0) return 0;
    return reward / risk;
  }

  get lotSize(): number {
    const entry = this.form.get('entry')?.value || 0;
    const sl = this.form.get('sl')?.value || 0;
    
    if (!entry || !sl) return 0;
    const distance = Math.abs(entry - sl);
    if (distance === 0) return 0;
    
    return (this.riskAmount / distance);
  }

  setType(type: string) {
    this.form.get('type')?.setValue(type);
  }

  saveTrade() {
    if (this.form.invalid) return;

    const val = this.form.value;
    
    const newTrade: Trade = {
      id: self.crypto.randomUUID(),
      pair: (val.pair || '').toUpperCase(),
      type: val.type as 'BUY' | 'SELL',
      entry: val.entry || 0,
      sl: val.sl || 0,
      tp: val.tp || 0,
      result: 'OPEN',
      profit: 0,
      // CHANGE: Save full timestamp instead of just date part
      date: new Date().toISOString(),
      notes: val.notes || '',
      riskPercent: val.riskPercent || 0,
      lotSize: this.lotSize
    };

    this.dataService.addTrade(newTrade);
    this.form.reset({
      pair: '',
      type: 'BUY',
      capital: val.capital, // Keep capital
      riskPercent: val.riskPercent // Keep risk
    });
    
    this.viewChange.emit('journal');
  }
}