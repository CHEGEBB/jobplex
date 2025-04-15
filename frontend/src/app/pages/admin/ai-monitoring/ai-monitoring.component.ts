import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { SidebarAdminComponent } from '../../../components/sidebar-admin/sidebar-admin.component';

@Component({
  selector: 'app-ai-monitoring',
  standalone: true,
  imports: [CommonModule, SidebarAdminComponent, FormsModule],
  templateUrl: './ai-monitoring.component.html',
  styleUrls: ['./ai-monitoring.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('pulse', [
      state('normal', style({ transform: 'scale(1)' })),
      state('pulse', style({ transform: 'scale(1.05)' })),
      transition('normal <=> pulse', animate('0.3s ease-in-out'))
    ])
  ]
})
export class AiMonitoringComponent implements OnInit {
  // Model performance metrics
  modelPerformance = {
    accuracy: 94.7,
    precision: 92.5,
    recall: 91.8,
    f1Score: 92.1,
    lastUpdated: '2 hours ago'
  };

  // Training data stats
  trainingData = {
    totalSamples: 145732,
    labeledData: 142981,
    pendingReview: 2751,
    lastTrainingDate: 'April 10, 2025'
  };

  // Match accuracy metrics
  matchAccuracy = {
    overallScore: 88,
    skillsAccuracy: 92,
    experienceMatching: 85,
    educationRelevance: 89,
    improvementRate: 2.3
  };

  // Sample algorithms
  algorithms = [
    { id: 1, name: 'SkillMatch Core', status: 'Active', accuracy: 94.7, lastModified: 'April 11, 2025' },
    { id: 2, name: 'Experience Evaluator', status: 'Active', accuracy: 91.2, lastModified: 'April 8, 2025' },
    { id: 3, name: 'CV Parser v2', status: 'In Testing', accuracy: 88.5, lastModified: 'April 9, 2025' },
    { id: 4, name: 'Role Recommender', status: 'Active', accuracy: 90.1, lastModified: 'April 7, 2025' }
  ];

  // Error logs
  recentErrors = [
    { id: 1, timestamp: 'April 12, 2025 - 14:23:45', type: 'Parsing Error', description: 'Failed to parse PDF with complex formatting', status: 'Fixed' },
    { id: 2, timestamp: 'April 12, 2025 - 12:01:12', type: 'Match Failure', description: 'Low confidence match for specialized skills', status: 'Under Review' },
    { id: 3, timestamp: 'April 11, 2025 - 09:45:21', type: 'Processing Timeout', description: 'Large dataset processing exceeded time limit', status: 'In Progress' }
  ];

  // AB tests
  abTests = [
    { id: 1, name: 'Skill Weight Adjustment', status: 'Running', startDate: 'April 5, 2025', participants: 2500, progress: 70 },
    { id: 2, name: 'Experience Recognition Algorithm', status: 'Scheduled', startDate: 'April 15, 2025', participants: 3000, progress: 0 },
    { id: 3, name: 'Education-Role Correlation', status: 'Completed', startDate: 'March 25, 2025', participants: 2800, progress: 100 }
  ];

  // Feedback data
  feedbackData = {
    positive: 72,
    neutral: 18,
    negative: 10,
    totalFeedbacks: 843,
    actionRequired: 47
  };

  // System health data
  systemHealth = {
    cpuUsage: 42,
    memoryUsage: 58,
    apiLatency: 120,
    databaseHealth: 'Optimal',
    lastIncident: 'April 9, 2025'
  };

  // Chart data
  performanceData = [65, 72, 78, 75, 82, 87, 94];
  chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  
  // States for UI interaction
  activeTab = 'performance';
  selectedAlgorithm: any = null;
  feedbackExpanded = false;
  showSystemMetrics = true;
  menuOpen = false;
  
  // Helper methods for template computations
  getActiveAlgorithmsCount(): number {
    return this.algorithms.filter(a => a.status === 'Active').length;
  }
  
  getLabeledDataPercentage(): number {
    return Math.round((this.trainingData.labeledData / this.trainingData.totalSamples) * 100);
  }
  
  getAlgorithmStatusClass(status: string): any {
    return {
      'bg-green-100 text-green-800': status === 'Active',
      'bg-yellow-100 text-yellow-800': status === 'In Testing',
      'bg-gray-100 text-gray-800': status === 'Paused'
    };
  }
  
  getErrorStatusClass(status: string): any {
    return {
      'bg-green-100 text-green-800': status === 'Fixed',
      'bg-yellow-100 text-yellow-800': status === 'Under Review',
      'bg-blue-100 text-blue-800': status === 'In Progress'
    };
  }
  
  getTestStatusClass(status: string): any {
    return {
      'bg-blue-100 text-blue-800': status === 'Running',
      'bg-gray-100 text-gray-800': status === 'Scheduled',
      'bg-green-100 text-green-800': status === 'Completed'
    };
  }
  
  getCpuUsageClass(): any {
    return {
      'text-green-600': this.systemHealth.cpuUsage < 50,
      'text-yellow-600': this.systemHealth.cpuUsage >= 50 && this.systemHealth.cpuUsage < 80,
      'text-red-600': this.systemHealth.cpuUsage >= 80
    };
  }
  
  getCpuBarClass(): any {
    return {
      'bg-green-500': this.systemHealth.cpuUsage < 50,
      'bg-yellow-500': this.systemHealth.cpuUsage >= 50 && this.systemHealth.cpuUsage < 80,
      'bg-red-500': this.systemHealth.cpuUsage >= 80
    };
  }
  
  getMemoryUsageClass(): any {
    return {
      'text-green-600': this.systemHealth.memoryUsage < 50,
      'text-yellow-600': this.systemHealth.memoryUsage >= 50 && this.systemHealth.memoryUsage < 80,
      'text-red-600': this.systemHealth.memoryUsage >= 80
    };
  }
  
  getMemoryBarClass(): any {
    return {
      'bg-green-500': this.systemHealth.memoryUsage < 50,
      'bg-yellow-500': this.systemHealth.memoryUsage >= 50 && this.systemHealth.memoryUsage < 80,
      'bg-red-500': this.systemHealth.memoryUsage >= 80
    };
  }
  
  // UI interaction methods
  toggleTab(tab: string) {
    this.activeTab = tab;
  }
  
  selectAlgorithm(algorithm: any) {
    this.selectedAlgorithm = algorithm;
  }
  
  toggleFeedback() {
    this.feedbackExpanded = !this.feedbackExpanded;
  }
  
  toggleSystemMetrics() {
    this.showSystemMetrics = !this.showSystemMetrics;
  }
  
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  ngOnInit(): void {
    // Simulate data loading for a more dynamic feel
    setTimeout(() => {
      // This would be replaced with actual API calls once backend is ready
      console.log('AI monitoring data loaded');
    }, 500);
  }

  // Methods for model adjustments (these would connect to real services later)
  retrainModel() {
    alert('Model retraining initiated. This process will take approximately 4 hours.');
  }

  pauseAlgorithm(id: number) {
    this.algorithms = this.algorithms.map(algo => 
      algo.id === id ? {...algo, status: 'Paused'} : algo
    );
  }

  resumeAlgorithm(id: number) {
    this.algorithms = this.algorithms.map(algo => 
      algo.id === id ? {...algo, status: 'Active'} : algo
    );
  }

  reviewError(id: number) {
    alert(`Opening detailed review for error #${id}`);
  }

  startTest(id: number) {
    this.abTests = this.abTests.map(test => 
      test.id === id && test.status === 'Scheduled' ? {...test, status: 'Running'} : test
    );
  }
  getActiveAlgorithmsString(): string {
    const activeCount = this.algorithms.filter(a => a.status === 'Active').length;
    return `${activeCount}/${this.algorithms.length}`;
  }

  reviewFeedback() {
    alert('Opening feedback review panel');
  }
}