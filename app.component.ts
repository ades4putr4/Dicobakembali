import { Component, OnInit, OnDestroy, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplashComponent } from './components/splash.component';
import { DashboardComponent } from './components/dashboard.component';
import { TradeFormComponent } from './components/trade-form.component';
import { TradeListComponent } from './components/trade-list.component';
import { SignalDashboardComponent } from './components/signal-dashboard.component';
import { MenuComponent } from './components/menu.component';
import { DataService, Trade } from './services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SplashComponent, DashboardComponent, TradeFormComponent, TradeListComponent, SignalDashboardComponent, MenuComponent],
  templateUrl: './app.component.html',
  styles: [`
    :host { display: block; height: 100vh; overflow: hidden; }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  dataService = inject(DataService); // Inject DataService public for template
  
  showSplash = signal(true);
  currentView = signal<'dashboard' | 'plan' | 'journal' | 'signals' | 'menu'>('dashboard');
  
  // Realtime clock signal
  now = signal(new Date());
  private timer: any;

  constructor() {}

  ngOnInit() {
    setTimeout(() => {
      this.showSplash.set(false);
    }, 3000);

    // Update clock every second
    this.timer = setInterval(() => {
      this.now.set(new Date());
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  switchView(view: 'dashboard' | 'plan' | 'journal' | 'signals' | 'menu') {
    this.currentView.set(view);
  }
}