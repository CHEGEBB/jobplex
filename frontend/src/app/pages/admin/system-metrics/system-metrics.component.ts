// system-metrics.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { SidebarAdminComponent } from '../../../components/sidebar-admin/sidebar-admin.component';

@Component({
  selector: 'app-system-metrics',
  standalone: true,
  imports: [CommonModule, SidebarAdminComponent, FormsModule],
  templateUrl: './system-metrics.component.html',
  styleUrls: ['./system-metrics.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('pulse', [
      transition('* => *', [
        style({ transform: 'scale(1)' }),
        animate('1s ease-in-out', style({ transform: 'scale(1.05)' })),
        animate('1s ease-in-out', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class SystemMetricsComponent implements OnInit {
  // Demo data
  serverHealth = 92;
  apiResponseTime = 187; // ms
  databaseHealth = 95;
  errorRate = 0.8; // percentage
  cpuUsage = 62;
  memoryUsage = 71;
  diskUsage = 58;
  testsPassed = 98.5;
  
  // Demo charts data
  timeLabels = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
  cpuData = [45, 52, 49, 60, 72, 68, 63, 62];
  memoryData = [62, 58, 65, 70, 75, 73, 68, 71];
  apiResponseData = [220, 205, 190, 198, 210, 180, 175, 187];
  errorData = [1.2, 1.0, 0.8, 0.7, 0.9, 1.1, 0.9, 0.8];
  
  // Status indicators
  serverStatus = 'Operational';
  databaseStatus = 'Operational';
  apiStatus = 'Operational';
  
  // Alert data
  alerts = [
    { id: 1, message: 'High memory usage detected on worker node 3', timestamp: '10 min ago', severity: 'warning', read: false },
    { id: 2, message: 'Database backup completed successfully', timestamp: '35 min ago', severity: 'success', read: false },
    { id: 3, message: 'API latency spike in authentication service', timestamp: '1 hour ago', severity: 'warning', read: true },
    { id: 4, message: 'Auto-scaling triggered for web servers', timestamp: '3 hours ago', severity: 'info', read: true }
  ];
  
  // Region performance data
  regions = [
    { name: 'North America', uptime: 99.98, responseTime: 120, users: 45230 },
    { name: 'Europe', uptime: 99.95, responseTime: 145, users: 38750 },
    { name: 'Asia Pacific', uptime: 99.92, responseTime: 180, users: 29840 },
    { name: 'South America', uptime: 99.88, responseTime: 190, users: 12650 },
  ];
  
  // UI state
  selectedTimeframe = '24h';
  showAllAlerts = false;
  selectedTab = 'overview';
  
  // Mock chart animation
  chartDataUpdater: any;
  
  constructor() {}
  
  ngOnInit(): void {
    // Simulate real-time data updates
    this.chartDataUpdater = setInterval(() => {
      this.updateChartData();
    }, 5000);
  }
  
  ngOnDestroy(): void {
    if (this.chartDataUpdater) {
      clearInterval(this.chartDataUpdater);
    }
  }
  
  updateChartData(): void {
    // Simulate data changes
    this.cpuData = this.cpuData.map(value => this.getRandomVariation(value, 5));
    this.memoryData = this.memoryData.map(value => this.getRandomVariation(value, 3));
    this.apiResponseData = this.apiResponseData.map(value => this.getRandomVariation(value, 15));
    this.errorData = this.errorData.map(value => this.getRandomVariation(value, 0.2));
    
    // Update current values
    this.cpuUsage = this.cpuData[this.cpuData.length - 1];
    this.memoryUsage = this.memoryData[this.memoryData.length - 1];
    this.apiResponseTime = this.apiResponseData[this.apiResponseData.length - 1];
    this.errorRate = this.errorData[this.errorData.length - 1];
  }
  
  getRandomVariation(value: number, maxChange: number): number {
    const change = (Math.random() * maxChange * 2) - maxChange;
    return Math.max(0, Math.min(100, value + change));
  }
  
  setTimeframe(timeframe: string): void {
    this.selectedTimeframe = timeframe;
    // In a real app, this would trigger new data fetching
  }
  
  toggleAlertRead(alert: any): void {
    alert.read = !alert.read;
  }
  
  clearAllAlerts(): void {
    this.alerts = [];
  }
  
  selectTab(tab: string): void {
    this.selectedTab = tab;
  }
  
  getStatusClass(value: number): string {
    if (value > 90) return 'bg-green-500';
    if (value > 70) return 'bg-yellow-500';
    return 'bg-red-500';
  }
  
  getInvertedStatusClass(value: number): string {
    if (value < 1) return 'bg-green-500';
    if (value < 3) return 'bg-yellow-500';
    return 'bg-red-500';
  }
  
  toggleServerStatus(): void {
    // Demo interaction - toggle server status
    if (this.serverStatus === 'Operational') {
      this.serverStatus = 'Maintenance Mode';
      this.serverHealth = 70;
    } else {
      this.serverStatus = 'Operational';
      this.serverHealth = 92;
    }
  }
  
  runDiagnostics(): void {
    // Simulate running diagnostics
    this.serverStatus = 'Running Diagnostics...';
    setTimeout(() => {
      this.serverStatus = 'Operational';
      // Add a new alert
      this.alerts.unshift({
        id: this.alerts.length + 1,
        message: 'System diagnostics completed successfully',
        timestamp: 'just now',
        severity: 'success',
        read: false
      });
    }, 2000);
  }
}