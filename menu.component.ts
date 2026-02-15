import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 pt-2 animate-slide-up">
      <!-- Header -->
      <div class="flex items-center justify-between mb-2">
        <div>
          <h2 class="text-xl font-bold text-white">{{ dataService.t().menu_settings }}</h2>
        </div>
      </div>

      <!-- Settings List -->
      <div class="space-y-4">
        
        <!-- AI Scanner Group -->
        <div class="glass-panel p-4 rounded-2xl border border-white/5 space-y-4">
            <div class="mb-2">
                <h3 class="text-white font-bold">{{ dataService.t().menu_scanner_title }}</h3>
                <p class="text-xs text-gray-500">{{ dataService.t().menu_ai_desc }}</p>
            </div>
            
            <!-- XAU Toggle -->
            <div class="flex items-center justify-between bg-black/20 p-2 rounded-xl">
               <span class="text-xs font-bold text-amber-500 ml-2">XAUUSD</span>
               <button 
                 (click)="dataService.toggleScannerXAU()"
                 class="w-12 h-6 rounded-full p-1 transition-colors duration-300 relative"
                 [class.bg-amber-500]="dataService.settings().scannerXAU"
                 [class.bg-gray-700]="!dataService.settings().scannerXAU">
                 <div class="w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300"
                    [class.translate-x-6]="dataService.settings().scannerXAU"
                    [class.translate-x-0]="!dataService.settings().scannerXAU">
                 </div>
               </button>
            </div>

            <!-- BTC Toggle -->
            <div class="flex items-center justify-between bg-black/20 p-2 rounded-xl">
               <span class="text-xs font-bold text-blue-400 ml-2">BTCUSD</span>
               <button 
                 (click)="dataService.toggleScannerBTC()"
                 class="w-12 h-6 rounded-full p-1 transition-colors duration-300 relative"
                 [class.bg-blue-500]="dataService.settings().scannerBTC"
                 [class.bg-gray-700]="!dataService.settings().scannerBTC">
                 <div class="w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300"
                    [class.translate-x-6]="dataService.settings().scannerBTC"
                    [class.translate-x-0]="!dataService.settings().scannerBTC">
                 </div>
               </button>
            </div>
        </div>

        <!-- NEW: Backup & Restore Section -->
        <div class="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
             <div class="mb-2">
                <h3 class="text-white font-bold">{{ dataService.t().menu_backup_title }}</h3>
                <p class="text-xs text-gray-500">{{ dataService.t().menu_backup_desc }}</p>
            </div>
            
            <button (click)="exportData()" class="w-full flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-left">
                <span class="text-sm font-medium text-gray-200">{{ dataService.t().menu_export }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            </button>

            <button (click)="fileInput.click()" class="w-full flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-left">
                <span class="text-sm font-medium text-gray-200">{{ dataService.t().menu_import }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
            </button>
            <input #fileInput type="file" (change)="importData($event)" accept=".json" class="hidden">
        </div>

        <!-- Language Toggle -->
        <div class="glass-panel p-4 rounded-2xl flex items-center justify-between border border-white/5">
           <div>
              <h3 class="text-white font-bold">{{ dataService.t().menu_lang }}</h3>
              <p class="text-xs text-gray-500">
                  {{ dataService.settings().language === 'id' ? 'Bahasa Indonesia' : 'English' }}
              </p>
           </div>
           <button 
             (click)="dataService.toggleLanguage()"
             class="px-4 py-2 bg-white/10 rounded-lg text-xs font-bold text-amber-500 border border-white/10 hover:bg-white/20 transition-all">
             SWITCH
           </button>
        </div>

        <!-- App Info Card -->
        <div class="glass-panel p-4 rounded-2xl space-y-3 border border-white/5">
           <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ dataService.t().menu_app_info }}</h3>
           
           <div class="flex justify-between items-center py-2 border-b border-white/5">
              <span class="text-sm text-gray-300">Version</span>
              <span class="text-sm font-mono text-gray-500">1.3.0</span>
           </div>
           
           <div class="flex justify-between items-center py-2">
              <span class="text-sm text-gray-300">Developer</span>
              <span class="text-sm font-mono text-gray-500">Xhivas</span>
           </div>

           <!-- Reset Data (Moved here) -->
            <button (click)="reset()" class="w-full mt-4 py-3 rounded-xl border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 text-xs font-bold tracking-widest transition-all">
                {{ dataService.t().dash_reset }}
            </button>
        </div>
        
        <div class="text-center pt-8 pb-4">
             <p class="text-[10px] text-gray-600 uppercase tracking-[0.2em]">{{ dataService.t().menu_copyright }}</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-slide-up {
        animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class MenuComponent {
  dataService = inject(DataService);

  reset() {
    if(confirm(this.dataService.t().dash_reset_confirm)) {
      this.dataService.resetData();
    }
  }

  exportData() {
    const data = {
        trades: this.dataService.trades(),
        settings: this.dataService.settings(),
        timestamp: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `DimensiTrader_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  importData(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!confirm(this.dataService.t().menu_import_confirm)) {
        event.target.value = ''; // Reset input
        return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.trades) {
                this.dataService.trades.set(data.trades);
                localStorage.setItem('dimensi_trader_data', JSON.stringify(data.trades));
            }
            if (data.settings) {
                this.dataService.settings.set(data.settings);
                localStorage.setItem('dimensi_trader_settings', JSON.stringify(data.settings));
            }
            alert(this.dataService.t().menu_import_success);
        } catch (err) {
            console.error(err);
            alert(this.dataService.t().menu_import_error);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
  }
}