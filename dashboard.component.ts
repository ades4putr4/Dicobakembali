import { Component, ElementRef, ViewChild, effect, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      
      <!-- Net Profit Hero Card -->
      <div class="glass-panel p-5 rounded-3xl relative overflow-hidden group">
        <!-- Custom Background Icon: Abstract Rising Profit -->
        <div class="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.5">
             <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-linejoin="round" />
          </svg>
        </div>
        <p class="text-gray-400 text-xs font-medium uppercase tracking-widest mb-1">{{ dataService.t().dash_net_profit }}</p>
        <div class="flex items-baseline gap-1 relative z-10">
          <h3 class="text-4xl font-bold tracking-tight" 
             [class.text-white]="dataService.totalProfit() === 0"
             [class.text-green-400]="dataService.totalProfit() > 0"
             [class.text-red-400]="dataService.totalProfit() < 0">
            {{ dataService.totalProfit() >= 0 ? '' : '-' }}{{ Math.abs(dataService.totalProfit()) | currency:'USD':'symbol':'1.0-0' }}
          </h3>
          <span class="text-sm text-gray-500">USD</span>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Win Rate -->
        <div class="glass-panel p-4 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
          <div class="flex justify-between items-start relative z-10">
             <div class="p-2 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
               <!-- Custom Icon: Pie Chart / Target -->
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                 <path stroke-linecap="round" stroke-linejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
               </svg>
             </div>
             <span class="text-xs text-gray-500">{{ dataService.totalTrades() }} Trades</span>
          </div>
          <div class="relative z-10">
            <h3 class="text-2xl font-bold text-white">{{ dataService.winRate() | number:'1.0-1' }}<span class="text-sm font-normal text-gray-400">%</span></h3>
            <p class="text-[10px] text-gray-400 uppercase tracking-wider">{{ dataService.t().dash_win_rate }}</p>
          </div>
          <!-- Decorative BG -->
          <div class="absolute -bottom-2 -right-2 opacity-5">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" viewBox="0 0 24 24" fill="currentColor">
               <circle cx="12" cy="12" r="10" />
             </svg>
          </div>
        </div>

        <!-- Win/Loss Ratio -->
        <div class="glass-panel p-4 rounded-2xl flex flex-col justify-between h-28">
           <div class="flex space-x-2 mb-2">
             <div class="flex-1 bg-green-500/10 rounded-lg p-2 text-center border border-green-500/10 flex flex-col items-center justify-center">
               <div class="text-lg font-bold text-green-400 leading-none">{{ dataService.wins() }}</div>
               <!-- Icon: Up Arrow -->
               <svg class="h-3 w-3 text-green-500/50 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
               </svg>
             </div>
             <div class="flex-1 bg-red-500/10 rounded-lg p-2 text-center border border-red-500/10 flex flex-col items-center justify-center">
               <div class="text-lg font-bold text-red-400 leading-none">{{ dataService.losses() }}</div>
               <!-- Icon: Down Arrow -->
               <svg class="h-3 w-3 text-red-500/50 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
               </svg>
             </div>
           </div>
           <p class="text-[10px] text-center text-gray-400 uppercase tracking-wider">{{ dataService.t().dash_performance }}</p>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="glass-panel p-5 rounded-3xl border border-white/5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-white font-semibold text-sm flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {{ dataService.t().dash_equity }}
          </h3>
        </div>
        <div #chartContainer class="w-full h-56 rounded-xl overflow-hidden relative">
           <!-- Chart renders here -->
        </div>
      </div>
      
    </div>
  `
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  dataService = inject(DataService);
  Math = Math; // Make Math available in template
  
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  private resizeObserver: ResizeObserver | undefined;

  constructor() {
    effect(() => {
      const data = this.dataService.equityCurve();
      if (this.chartContainer?.nativeElement) {
        requestAnimationFrame(() => this.renderChart(data));
      }
    });
  }

  ngAfterViewInit() {
    if (this.chartContainer?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => this.renderChart(this.dataService.equityCurve()));
      });
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  renderChart(data: any[]) {
    if (!this.chartContainer) return;
    const element = this.chartContainer.nativeElement;

    // Remove existing
    d3.select(element).selectAll('*').remove();

    if (!data || data.length === 0) {
      d3.select(element)
        .append('div')
        .attr('class', 'h-full flex items-center justify-center text-gray-600 text-xs italic')
        .text(this.dataService.t().dash_no_data);
      return;
    }

    // Get dimensions
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width === 0 || height === 0) return;

    // Increased margins to fit Axis Labels (Numbers)
    const margin = { top: 20, right: 15, bottom: 30, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3.scaleLinear()
      .domain([0, data.length > 1 ? data.length - 1 : 1])
      .range([0, innerWidth]);

    // Y scale
    const minVal = d3.min(data, (d: any) => d.value) || 0;
    const maxVal = d3.max(data, (d: any) => d.value) || 0;
    let yMin = minVal;
    let yMax = maxVal;
    
    // Add padding to Y domain so the line isn't glued to top/bottom
    if (yMin === yMax) {
        yMin -= 100;
        yMax += 100;
    } else {
        const padding = (yMax - yMin) * 0.2;
        yMin -= padding;
        yMax += padding;
    }

    const y = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([innerHeight, 0]);

    // Define Gradients & Filters
    const defs = svg.append("defs");
    
    // Line Gradient
    const lineGradient = defs.append("linearGradient")
      .attr("id", "line-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");
    lineGradient.append("stop").attr("offset", "0%").attr("stop-color", "#F59E0B"); // Amber 450
    lineGradient.append("stop").attr("offset", "100%").attr("stop-color", "#FCD34D"); // Amber 200

    // Area Gradient
    const areaGradient = defs.append("linearGradient")
      .attr("id", "area-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    areaGradient.append("stop").attr("offset", "0%").attr("stop-color", "#F59E0B").attr("stop-opacity", 0.2);
    areaGradient.append("stop").attr("offset", "100%").attr("stop-color", "#F59E0B").attr("stop-opacity", 0);

    // Glow Filter
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // --- Add Gridlines ---
    const makeYLines = () => d3.axisLeft(y).ticks(5);
    svg.append("g")
      .attr("class", "grid")
      .call(makeYLines()
        .tickSize(-innerWidth)
        .tickFormat('' as any)
      )
      .attr("stroke-opacity", 0.1) // Very subtle grid
      .attr("stroke-dasharray", "2 2")
      .call(g => g.select(".domain").remove()) // Remove vertical line
      .selectAll("line")
      .attr("stroke", "#4b5563");

    // --- Add Axes with Numbers ---
    
    // X Axis (Trade Count or Date index)
    svg.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x)
        .ticks(Math.min(data.length, 5)) // Don't show too many ticks
        .tickFormat((d: any) => `T${Math.round(d + 1)}`) // Format as T1, T2...
        .tickSize(0)
        .tickPadding(10)
      )
      .call(g => g.select(".domain").remove())
      .selectAll("text")
      .attr("fill", "#6b7280")
      .style("font-size", "10px")
      .style("font-family", "Inter, sans-serif");

    // Y Axis (Currency)
    svg.append("g")
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickFormat((d: any) => `${d}`)
        .tickSize(0)
        .tickPadding(10)
      )
      .call(g => g.select(".domain").remove())
      .selectAll("text")
      .attr("fill", "#6b7280")
      .style("font-size", "10px")
      .style("font-family", "Inter, sans-serif");


    // --- Draw Data ---

    // Line Generator
    const line = d3.line<any>()
      .x((d, i) => x(i))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // Area Generator
    const area = d3.area<any>()
      .x((d, i) => x(i))
      .y0(innerHeight)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // Draw Area
    svg.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area)
      .style("fill", "url(#area-gradient)");

    // Draw Line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "url(#line-gradient)")
      .attr("stroke-width", 3)
      .attr("d", line)
      .style("filter", "url(#glow)"); // Apply glow

    // Draw baseline (Zero)
    if (yMin < 0 && yMax > 0) {
      svg.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .attr("stroke", "#9ca3af")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 4")
        .attr("opacity", 0.5);
    }

    // Dots for data points
    svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", (d, i) => x(i))
      .attr("cy", d => y(d.value))
      .attr("r", 4)
      .attr("fill", "#0a0a0a")
      .attr("stroke", "#F59E0B")
      .attr("stroke-width", 2);
  }
}