import { Component, inject, signal, computed, AfterViewInit, ElementRef, ViewChild, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignalService, ForexSignal, MarketAnalysis } from '../services/signal.service';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-signal-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative min-h-full pb-24">
      
      <!-- Content Container -->
      <div class="relative z-10 space-y-4">
        
        <!-- Header & Live Status -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              {{ dataService.t().sig_room }}
            </h2>
            <p class="text-xs text-gray-500">{{ dataService.t().sig_desc }}</p>
          </div>
          
          <!-- Live Status Indicator -->
          <div class="flex flex-col items-end">
             @if(dataService.settings().scannerXAU || dataService.settings().scannerBTC) {
                <div class="flex items-center gap-2 bg-green-900/20 border border-green-500/30 rounded-full px-3 py-1">
                    <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                    <span class="text-[10px] font-bold text-green-400 tracking-wide uppercase">LIVE</span>
                </div>
                <p class="text-[9px] text-gray-600 mt-1 font-mono">
                    {{ signalService.currentActivity() }} ({{ signalService.nextScanIn() }}s)
                </p>
             } @else {
                <div class="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-full px-3 py-1">
                    <div class="w-2 h-2 rounded-full bg-gray-500"></div>
                    <span class="text-[10px] font-bold text-gray-400 tracking-wide uppercase">OFF</span>
                </div>
                <p class="text-[9px] text-gray-600 mt-1 font-mono">Enable in Menu</p>
             }
          </div>
        </div>

        <!-- NEW: AI DAILY PERFORMANCE CARD -->
        <div class="grid grid-cols-3 gap-2">
            <div class="col-span-1 bg-[#1a1a1a] rounded-xl p-3 border border-white/5 flex flex-col justify-center items-center">
                <span class="text-[9px] text-gray-500 uppercase tracking-widest mb-1">{{ dataService.t().sig_ai_win }}</span>
                <div class="text-xl font-bold" 
                     [class.text-green-400]="aiDailyStats().rate >= 50"
                     [class.text-red-400]="aiDailyStats().rate < 50"
                     [class.text-gray-400]="aiDailyStats().totalClosed === 0">
                    {{ aiDailyStats().rate | number:'1.0-0' }}%
                </div>
                <span class="text-[9px] text-gray-600">{{ dataService.t().sig_today }}</span>
            </div>
            
            <div class="col-span-2 bg-[#1a1a1a] rounded-xl p-3 border border-white/5 flex items-center justify-between px-6">
                <div class="text-center">
                    <span class="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Signals</span>
                    <span class="text-lg font-bold text-white">{{ aiDailyStats().total }}</span>
                </div>
                <div class="h-8 w-px bg-white/10"></div>
                <div class="text-center">
                    <span class="text-[9px] text-green-500/70 uppercase tracking-widest block mb-1">Win</span>
                    <span class="text-lg font-bold text-green-400">{{ aiDailyStats().wins }}</span>
                </div>
                <div class="h-8 w-px bg-white/10"></div>
                <div class="text-center">
                    <span class="text-[9px] text-red-500/70 uppercase tracking-widest block mb-1">Loss</span>
                    <span class="text-lg font-bold text-red-400">{{ aiDailyStats().losses }}</span>
                </div>
            </div>
        </div>

        <!-- Active Opportunities / Automatic List -->
        @if (signalService.activeSignals().length > 0) {
           <div class="space-y-3 animate-fade-in">
              <h3 class="text-[10px] text-amber-500 font-bold uppercase tracking-widest border-l-2 border-amber-500 pl-2">
                  {{ dataService.t().sig_active }} ({{ signalService.activeSignals().length }})
              </h3>
              
              @for (signal of signalService.activeSignals(); track signal.id) {
                  <div class="glass-panel rounded-2xl overflow-hidden border shadow-lg relative transition-all hover:scale-[1.01]"
                       [class.border-green-500/30]="signal.action === 'BUY'"
                       [class.border-red-500/30]="signal.action === 'SELL'">
                       
                       <!-- Background Glow -->
                       <div class="absolute inset-0 opacity-10 pointer-events-none"
                            [class.bg-green-500]="signal.action === 'BUY'"
                            [class.bg-red-500]="signal.action === 'SELL'"></div>
                       
                       <div class="absolute right-0 top-0 bottom-0 w-1.5"
                           [class.bg-green-500]="signal.action === 'BUY'"
                           [class.bg-red-500]="signal.action === 'SELL'"></div>

                      <!-- Top Row -->
                      <div class="p-3 flex justify-between items-start relative z-10">
                          <div class="flex items-center gap-3">
                              <div class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner border border-white/5 bg-[#1a1a1a]"
                                   [class.text-green-400]="signal.action === 'BUY'"
                                   [class.text-red-400]="signal.action === 'SELL'">
                                  {{ signal.action === 'BUY' ? 'B' : 'S' }}
                              </div>
                              <div>
                                  <div class="flex items-center gap-2">
                                     <span class="text-sm font-bold text-white">{{ signal.pair }}</span>
                                     <span class="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono">{{ signal.timeframe }}</span>
                                  </div>
                                  <span class="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                     Confidence: <b class="text-white">{{ signal.score }}%</b>
                                     <span class="w-1.5 h-1.5 rounded-full" [style.background]="getScoreColor(signal.score)"></span>
                                  </span>
                              </div>
                          </div>
                          
                          <button (click)="signalService.closeSignal(signal.id, 'WIN')" class="px-3 py-1.5 text-[10px] font-bold bg-white/5 rounded-lg border border-white/10 hover:bg-green-500 hover:text-black transition-colors shadow-lg">
                              COMPLETE
                          </button>
                      </div>

                      <!-- Numbers Row -->
                      <div class="p-3 grid grid-cols-3 gap-2 text-center bg-[#0a0a0a]/50 border-t border-white/5 relative z-10">
                          <div class="bg-white/5 rounded p-1.5">
                              <p class="text-[8px] text-gray-500 uppercase tracking-wider mb-0.5">Entry Area</p>
                              <p class="text-xs font-mono font-bold text-white">{{ signal.entry }}</p>
                          </div>
                          <div class="bg-red-900/10 rounded p-1.5 border border-red-500/10">
                              <p class="text-[8px] text-red-500 uppercase tracking-wider mb-0.5">Stop Loss</p>
                              <p class="text-xs font-mono font-bold text-red-400">{{ signal.sl }}</p>
                          </div>
                          <div class="bg-green-900/10 rounded p-1.5 border border-green-500/10">
                              <p class="text-[8px] text-green-500 uppercase tracking-wider mb-0.5">Target</p>
                              <p class="text-xs font-mono font-bold text-green-400">{{ signal.tp }}</p>
                          </div>
                      </div>
                  </div>
              }
           </div>
        } @else {
            <div class="glass-panel p-6 border-dashed border-white/10 rounded-2xl flex flex-col items-center text-center animate-pulse">
                <div class="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mb-3">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" opacity="0.5" />
                   </svg>
                </div>
                <h3 class="text-sm font-bold text-gray-300">{{ dataService.t().sig_scanning }}</h3>
                <p class="text-xs text-gray-500 mt-1 max-w-[200px]">
                   AI is analyzing markets for high probability setups (Score > 70).
                </p>
            </div>
        }

        <!-- Manual Analysis Tools (Collapsible or Secondary) -->
        <div class="pt-4 border-t border-white/5 mt-6">
            <h3 class="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">{{ dataService.t().sig_manual }}</h3>
            
            <!-- Pair Selector -->
            <div class="flex overflow-x-auto no-scrollbar gap-2 pb-2">
              @for (pair of signalService.PAIRS; track pair) {
                <button 
                  (click)="selectPair(pair)"
                  class="px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shadow-lg flex flex-col items-center gap-1 min-w-[80px]"
                  [class.bg-amber-500]="selectedPair() === pair"
                  [class.text-black]="selectedPair() === pair"
                  [class.border-amber-500]="selectedPair() === pair"
                  [class.bg-[#151515]/80]="selectedPair() !== pair"
                  [class.text-gray-400]="selectedPair() !== pair"
                  [class.border-white/5]="selectedPair() !== pair"
                  [class.backdrop-blur-md]="selectedPair() !== pair">
                  <span>{{ pair }}</span>
                  <span class="text-[9px] font-bold" *ngIf="selectedPair() === pair">VIEWING</span>
                </button>
              }
            </div>

            <!-- TradingView Chart -->
            <div class="glass-panel p-1 rounded-2xl overflow-hidden min-h-[300px] relative border border-white/10 shadow-2xl mt-2">
               <div class="absolute inset-0 flex items-center justify-center -z-10">
                  <div class="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div #tvChartContainer class="tradingview-widget-container w-full h-full">
                  <div class="tradingview-widget-container__widget h-full"></div>
              </div>
            </div>
            
            <!-- AI MANUAL BUTTON -->
            <div class="mt-4">
               @if (!marketAnalysis) {
                    <button (click)="analyzeMarket()" [disabled]="isAnalyzing()"
                        class="w-full py-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-gray-300 hover:bg-white/10 transition-all">
                        @if (isAnalyzing()) {
                           <div class="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                           <span>{{ dataService.t().sig_analyzing }}</span>
                        } @else {
                           <span>{{ dataService.t().sig_analyze_btn }}</span>
                        }
                    </button>
                } @else {
                     <!-- Simple Manual Result Card -->
                     <div class="glass-panel p-3 rounded-xl border border-white/10 mt-2">
                        <div class="flex justify-between items-center">
                           <span class="text-xs font-bold text-white">{{ marketAnalysis.pair }} Bias:</span>
                           <span class="font-bold" 
                                [class.text-green-400]="marketAnalysis.bias === 'BUY'"
                                [class.text-red-400]="marketAnalysis.bias === 'SELL'">
                                {{ marketAnalysis.bias }} ({{ marketAnalysis.qualityScore }}%)
                           </span>
                        </div>
                        <p class="text-[10px] text-gray-500 mt-1 leading-relaxed">{{ marketAnalysis.reasoning }}</p>
                        <button (click)="marketAnalysis = null" class="w-full mt-2 py-2 text-[10px] text-gray-400 bg-black/20 rounded">Close Analysis</button>
                     </div>
                }
            </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .tradingview-widget-container iframe {
        width: 100% !important; 
        min-height: 350px !important;
        border-radius: 16px;
    }
    .animate-slide-up {
        animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
        animation: fadeIn 0.3s ease-in;
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
  `]
})
export class SignalDashboardComponent implements AfterViewInit {
  signalService = inject(SignalService);
  dataService = inject(DataService); 
  
  selectedPair = signal<string>('XAUUSD'); 
  
  aiDailyStats = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    const trades = this.dataService.trades();
    
    const aiTrades = trades.filter(t => 
        t.date === today && t.notes.includes('AI Signal')
    );
    
    const total = aiTrades.length;
    const wins = aiTrades.filter(t => t.result === 'WIN').length;
    const losses = aiTrades.filter(t => t.result === 'LOSS').length;
    const totalClosed = wins + losses;
    
    const rate = totalClosed > 0 ? (wins / totalClosed) * 100 : 0;
    
    return {
        total,
        wins,
        losses,
        rate,
        totalClosed
    };
  });
  
  manualEntryPrice: number | null = null;
  manualHighPrice: number | null = null;
  manualLowPrice: number | null = null;
  isAnalyzing = signal(false);
  errorMessage = signal<string | null>(null);
  marketAnalysis: MarketAnalysis | null = null;
  activeTab: 'BUY' | 'SELL' | null = null;
  generatedSignal: any = null;
  
  @ViewChild('tvChartContainer') chartContainer!: ElementRef;

  ngAfterViewInit() {
    this.loadWidgets();
  }

  selectPair(pair: string) {
    if (this.selectedPair() === pair) return;
    this.selectedPair.set(pair);
    this.manualEntryPrice = null;
    this.marketAnalysis = null;
    this.loadWidgets();
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#4ade80';
    if (score >= 60) return '#facc15';
    return '#f87171';
  }

  async analyzeMarket() {
    this.isAnalyzing.set(true);
    this.marketAnalysis = null;
    try {
        const result = await this.signalService.analyzeMarket(this.selectedPair());
        this.marketAnalysis = result;
    } catch (e: any) {
    } finally {
        this.isAnalyzing.set(false);
    }
  }

  loadWidgets() {
    const tvSymbol = this.signalService.TV_SYMBOLS[this.selectedPair()] || 'OANDA:XAUUSD';
    
    if (this.chartContainer) {
        this.chartContainer.nativeElement.innerHTML = '<div class="tradingview-widget-container__widget h-full"></div>';
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
          "autosize": true,
          "symbol": tvSymbol,
          "interval": "15",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "hide_top_toolbar": false,
          "hide_side_toolbar": false,
          "allow_symbol_change": false,
          "save_image": false,
          "calendar": false,
          "support_host": "https://www.tradingview.com",
          "studies": [
            "STD;Zig_Zag",
            "STD;Pivot_Points_High_Low"
          ]
        });
        this.chartContainer.nativeElement.appendChild(script);
    }
  }
}