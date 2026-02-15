import { Component, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Trade } from '../services/data.service';

@Component({
  selector: 'app-trade-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between sticky top-0 bg-[#050505]/95 backdrop-blur-xl py-3 z-20 border-b border-white/5">
        <h2 class="text-xl font-bold text-white tracking-tight">{{ dataService.t().jour_title }}</h2>
        
        <div class="flex items-center gap-3">
             <div class="text-xs text-amber-500 font-medium bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                {{ filteredTrades().length }} / {{ dataService.trades().length }}
             </div>
             
             <!-- Add Trade Button in Header -->
             <button (click)="onRequestNewTrade.emit()" class="w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-amber-500 to-amber-600 rounded-lg text-black shadow-lg shadow-amber-500/20 active:scale-95 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
             </button>
        </div>
      </div>

      <!-- Search & Filter Controls -->
      <div class="sticky top-14 z-10 bg-[#050505] pb-2 pt-1">
        <div class="flex gap-2">
            <!-- Search Input -->
            <div class="relative flex-1 group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 group-focus-within:text-amber-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input 
                    type="text" 
                    [(ngModel)]="searchTerm" 
                    [placeholder]="dataService.t().jour_search" 
                    class="w-full bg-[#151515] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                >
                @if(searchTerm()) {
                    <button (click)="searchTerm.set('')" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                }
            </div>

            <!-- Date Input -->
            <div class="relative w-1/3">
                 <input 
                    type="date" 
                    [(ngModel)]="filterDate"
                    class="w-full bg-[#151515] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all appearance-none min-h-[38px]"
                >
                <!-- Clear Date Button (Only visible if date selected) -->
                 @if(filterDate()) {
                    <button (click)="filterDate.set('')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-lg hover:bg-red-600 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                }
            </div>
        </div>
      </div>

      <!-- List -->
      <div class="space-y-3 pb-20 animate-fade-in">
        @for (trade of filteredTrades(); track trade.id) {
          <div class="glass-panel rounded-2xl p-4 relative group transition-all hover:bg-white/5 border border-white/5">
            
            <!-- Header Row -->
            <div class="flex justify-between items-center mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[10px] border"
                     [class.bg-green-500/10]="trade.type === 'BUY'" [class.text-green-400]="trade.type === 'BUY'" [class.border-green-500/20]="trade.type === 'BUY'"
                     [class.bg-red-500/10]="trade.type === 'SELL'" [class.text-red-400]="trade.type === 'SELL'" [class.border-red-500/20]="trade.type === 'SELL'">
                  {{ trade.type }}
                </div>
                <div>
                  <h3 class="font-bold text-white text-lg leading-none">{{ trade.pair }}</h3>
                  <p class="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                       <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                       <line x1="16" y1="2" x2="16" y2="6"></line>
                       <line x1="8" y1="2" x2="8" y2="6"></line>
                       <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <!-- UPDATED DATE DISPLAY WITH TIME -->
                    {{ trade.date | date:'dd MMM yyyy' }} 
                    <span class="text-amber-500/80 font-mono ml-1">{{ trade.date | date:'HH:mm' }}</span>
                  </p>
                </div>
              </div>

              <div class="text-right">
                 @if (trade.result === 'OPEN') {
                    <div class="flex items-center bg-[#151515] rounded-lg p-1 border border-white/5">
                      <button (click)="closeTrade(trade, 'WIN')" class="w-8 h-8 rounded-md flex items-center justify-center text-green-500 hover:bg-green-500/20 transition-colors cursor-pointer" title="Mark Win">
                        <!-- Custom Icon: Sharp Check -->
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                          <path stroke-linecap="square" stroke-linejoin="miter" d="M20 6L9 17l-5-5" />
                        </svg>
                      </button>
                      <div class="w-px h-4 bg-gray-700 mx-1"></div>
                      <button (click)="closeTrade(trade, 'LOSS')" class="w-8 h-8 rounded-md flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer" title="Mark Loss">
                         <!-- Custom Icon: Sharp X -->
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                           <path stroke-linecap="square" stroke-linejoin="miter" d="M6 18L18 6M6 6l12 12" />
                         </svg>
                      </button>
                    </div>
                 } @else {
                   <div class="px-3 py-1 rounded-lg border flex items-center gap-2"
                     [class.bg-green-500/5]="trade.result === 'WIN'" [class.border-green-500/20]="trade.result === 'WIN'"
                     [class.bg-red-500/5]="trade.result === 'LOSS'" [class.border-red-500/20]="trade.result === 'LOSS'">
                     <span class="text-xs font-bold" 
                       [class.text-green-400]="trade.profit > 0" 
                       [class.text-red-400]="trade.profit < 0">
                       {{ trade.profit > 0 ? '+' : '' }}{{ trade.profit | currency:'USD':'symbol':'1.0-0' }}
                     </span>
                   </div>
                 }
              </div>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-3 gap-2 bg-[#0a0a0a]/50 rounded-xl p-3 mb-2 border border-white/5">
              <div class="text-center">
                <span class="block text-[8px] text-gray-500 uppercase tracking-wide mb-0.5">Entry</span>
                <span class="text-xs text-gray-300 font-mono">{{ trade.entry }}</span>
              </div>
              <div class="text-center border-l border-white/5">
                <span class="block text-[8px] text-gray-500 uppercase tracking-wide mb-0.5">SL</span>
                <span class="text-xs text-red-400/80 font-mono">{{ trade.sl }}</span>
              </div>
              <div class="text-center border-l border-white/5">
                <span class="block text-[8px] text-gray-500 uppercase tracking-wide mb-0.5">TP</span>
                <span class="text-xs text-green-400/80 font-mono">{{ trade.tp }}</span>
              </div>
            </div>

            @if(trade.notes) {
              <div class="flex items-start gap-2 px-1 mb-2">
                <!-- Custom Icon: Sticky Note / Text -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-600 mt-0.5 min-w-[12px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <p class="text-xs text-gray-500 italic truncate">{{ trade.notes }}</p>
              </div>
            }

            <!-- Footer Row with Visible Delete Button -->
            <div class="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                <span class="text-[9px] text-gray-600 font-mono tracking-widest">ID: {{ trade.id.substring(0, 8) }}</span>
                <!-- Fixed Delete Button with Event Handling -->
                <button (click)="delete($event, trade.id)" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500/70 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span class="text-[10px] font-bold tracking-wide">{{ dataService.t().jour_delete }}</span>
                </button>
            </div>
          </div>
        } @empty {
          <div class="flex flex-col items-center justify-center py-20 opacity-50">
            <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
               <!-- Custom Icon: Empty Ghost / Box -->
               <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke-dasharray="4 4"/>
                <path d="M9 12h6" stroke-width="2"/>
              </svg>
            </div>
            <p class="text-gray-400">
                {{ dataService.t().jour_empty }}
            </p>
            <p class="text-xs text-gray-600 mt-1">
                {{ dataService.t().jour_empty_desc }}
            </p>
             <button (click)="onRequestNewTrade.emit()" class="mt-4 px-4 py-2 bg-white/10 rounded-full text-xs font-bold text-amber-500 border border-amber-500/20 hover:bg-amber-500/10 transition-colors">
                {{ dataService.t().jour_new_plan }}
             </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    /* Custom Date Input Styling for Webkit */
    input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
        opacity: 0.5;
    }
    input[type="date"]::-webkit-calendar-picker-indicator:hover {
        opacity: 1;
    }
  `]
})
export class TradeListComponent {
  dataService = inject(DataService);
  onRequestNewTrade = output<void>(); // Emit event when user wants to create a new plan
  
  // Signals for Search and Filter
  searchTerm = signal<string>('');
  filterDate = signal<string>('');

  // Computed signal to filter the trades automatically
  filteredTrades = computed(() => {
    const allTrades = this.dataService.trades();
    const term = this.searchTerm().toLowerCase();
    const date = this.filterDate();

    return allTrades.filter(trade => {
        // Text Search Logic
        const matchesTerm = !term || 
            trade.pair.toLowerCase().includes(term) ||
            trade.notes.toLowerCase().includes(term) ||
            trade.result.toLowerCase().includes(term);

        // Date Filter Logic (Match against YYYY-MM-DD)
        // Extract the date part from ISO string (or use directly if old format)
        const tradeDateStr = trade.date.split('T')[0];
        const matchesDate = !date || tradeDateStr === date;

        return matchesTerm && matchesDate;
    });
  });

  delete(event: Event, id: string) {
    event.stopPropagation();
    event.preventDefault(); // Good practice to prevent any default browser behavior
    
    if(confirm(this.dataService.t().jour_delete_confirm)) {
      this.dataService.deleteTrade(id);
    }
  }

  closeTrade(trade: Trade, result: 'WIN' | 'LOSS') {
    const distRisk = Math.abs(trade.entry - trade.sl);
    const distReward = Math.abs(trade.tp - trade.entry);
    
    // Profit Calculation Logic
    const finalProfit = result === 'WIN' 
      ? (trade.lotSize * distReward)
      : -(trade.lotSize * distRisk);

    const updated: Trade = {
      ...trade,
      result: result,
      profit: Math.round(finalProfit * 100) / 100 
    };
    
    this.dataService.trades.update(list => list.map(t => t.id === trade.id ? updated : t));
  }
}