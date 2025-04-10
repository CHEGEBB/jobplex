import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { CountUpModule } from 'ngx-countup'; 

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    CountUpModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // Navigation
  mobileMenuOpen = false;
  activeSection = 'home';

  // Parallax Elements
  techIcons = [
    { class: 'fab fa-angular', bgClass: 'bg-red-100 text-red-500', delay: 0 },
    { class: 'fab fa-react', bgClass: 'bg-blue-100 text-blue-500', delay: 0.5 },
    { class: 'fab fa-node-js', bgClass: 'bg-green-100 text-green-500', delay: 1 },
    { class: 'fab fa-python', bgClass: 'bg-yellow-100 text-yellow-500', delay: 1.5 },
    { class: 'fab fa-js', bgClass: 'bg-yellow-100 text-yellow-600', delay: 2 },
    { class: 'fab fa-java', bgClass: 'bg-blue-100 text-blue-600', delay: 2.5 }
  ];

  // Jobs Section
  jobCategories = ['All', 'Technology', 'Design', 'Marketing', 'Engineering', 'Finance'];
  activeJobCategory = 'All';
  jobs = [
    {
      title: 'Senior Angular Developer',
      company: 'TechCorp Inc.',
      companyInitials: 'TC',
      location: 'Remote',
      skills: ['Angular', 'TypeScript', 'RxJS'],
      salary: '$120K - $150K',
      matchPercentage: 95,
      postedDays: 2,
      category: 'Technology'
    },
    {
      title: 'UX/UI Designer',
      company: 'Creative Studios',
      companyInitials: 'CS',
      location: 'New York',
      skills: ['Figma', 'Adobe XD', 'User Research'],
      salary: '$90K - $120K',
      matchPercentage: 88,
      postedDays: 3,
      category: 'Design'
    },
    {
      title: 'Full Stack Developer',
      company: 'Innovate Solutions',
      companyInitials: 'IS',
      location: 'San Francisco',
      skills: ['React', 'Node.js', 'MongoDB'],
      salary: '$110K - $140K',
      matchPercentage: 92,
      postedDays: 1,
      category: 'Technology'
    },
    {
      title: 'Marketing Manager',
      company: 'Growth Accelerators',
      companyInitials: 'GA',
      location: 'Chicago',
      skills: ['Content Strategy', 'SEO', 'Analytics'],
      salary: '$85K - $110K',
      matchPercentage: 85,
      postedDays: 4,
      category: 'Marketing'
    },
    {
      title: 'DevOps Engineer',
      company: 'Cloud Solutions',
      companyInitials: 'CS',
      location: 'Austin',
      skills: ['AWS', 'Docker', 'Kubernetes'],
      salary: '$130K - $160K',
      matchPercentage: 90,
      postedDays: 2,
      category: 'Engineering'
    },
    {
      title: 'Financial Analyst',
      company: 'Global Finance',
      companyInitials: 'GF',
      location: 'Boston',
      skills: ['Financial Modeling', 'Excel', 'Data Analysis'],
      salary: '$95K - $120K',
      matchPercentage: 87,
      postedDays: 3,
      category: 'Finance'
    }
  ];
  filteredJobs = this.jobs;

  // Testimonials
  testimonials = [
    {
      name: 'Sarah Johnson',
      position: 'Full Stack Developer',
      initials: 'SJ',
      content: 'JobPlex completely transformed my job search. I was matched with positions I never would have found otherwise and landed my dream role at a tech company I love!'
    },
    {
      name: 'Michael Patel',
      position: 'CTO, TechInnovate',
      initials: 'MP',
      content: 'As a hiring manager, JobPlex has revolutionized our recruitment process. The quality of candidates we\'re matched with is exceptional, saving us time and resources.'
    },
    {
      name: 'Alex Wong',
      position: 'UX Designer',
      initials: 'AW',
      content: 'The skill analysis tool is incredibly accurate. JobPlex identified strengths I didn\'t even realize I had and connected me with a position that perfectly matched my abilities.'
    }
  ];
  activeTestimonialIndex = 0;

  // Animation tracking
  animatedElements = new Set<Element>();
  
  constructor() { }

  ngOnInit(): void {
    // Initialize scroll observation for animations
    this.observeScrollAnimations();
    
    // Initialize scroll position for active section tracking
    this.checkActiveSection();
    
    // Initialize back to top button visibility
    this.toggleBackToTopButton();
    
    // Initialize parallax effect
    this.initParallax();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.checkActiveSection();
    this.toggleBackToTopButton();
    this.triggerScrollAnimations();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.updateParallaxEffect(event);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenuAndNavigate(section: string) {
    this.mobileMenuOpen = false;
    this.activeSection = section;
    // Allow time for mobile menu to close before scrolling
    setTimeout(() => {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleBackToTopButton() {
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
      if (window.scrollY > 500) {
        backToTopButton.classList.remove('opacity-0', 'translate-y-10');
      } else {
        backToTopButton.classList.add('opacity-0', 'translate-y-10');
      }
    }
  }

  checkActiveSection() {
    const sections = ['home', 'jobs', 'features', 'howitworks', 'testimonials'];
    let currentActive = 'home';
    
    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          currentActive = section;
          break;
        }
      }
    }
    
    this.activeSection = currentActive;
  }

  setActiveJobCategory(category: string) {
    this.activeJobCategory = category;
    this.filteredJobs = category === 'All' 
      ? this.jobs 
      : this.jobs.filter(job => job.category === category);
  }

  prevTestimonial() {
    this.activeTestimonialIndex = this.activeTestimonialIndex === 0 
      ? this.testimonials.length - 1 
      : this.activeTestimonialIndex - 1;
  }

  nextTestimonial() {
    this.activeTestimonialIndex = (this.activeTestimonialIndex + 1) % this.testimonials.length;
  }

  setActiveTestimonial(index: number) {
    this.activeTestimonialIndex = index;
  }

  // Scroll Animations
  observeScrollAnimations() {
    // Set initial state for animations
    const animatableElements = document.querySelectorAll('.animate-on-scroll');
    animatableElements.forEach(element => {
      element.classList.add('opacity-0');
    });
  }

  triggerScrollAnimations() {
    const animatableElements = document.querySelectorAll('.animate-on-scroll:not(.animated)');
    animatableElements.forEach(element => {
      if (this.isElementInViewport(element) && !this.animatedElements.has(element)) {
        element.classList.add('animated');
        this.animatedElements.add(element);
      }
    });
  }

  isElementInViewport(el: Element) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85
    );
  }

  animateOnScroll(animation: string, delay: number = 0) {
    return `animate-on-scroll ${animation} opacity-0` + (delay > 0 ? ` delay-${delay}` : '');
  }

  // Parallax Effects
  initParallax() {
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    parallaxLayers.forEach(layer => {
      layer.classList.add('transition-transform', 'duration-300', 'ease-out');
    });
  }

  updateParallaxEffect(event: MouseEvent) {
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Calculate mouse position relative to center
    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;
    
    parallaxLayers.forEach(layer => {
      // Fixed: Use bracket notation to access dataset property
      const depth = parseFloat((layer as HTMLElement).dataset['depth'] || '0.1');
      const moveX = mouseX * depth * -1;
      const moveY = mouseY * depth * -1;
      
      (layer as HTMLElement).style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  }

  // Random particles for hero background
  getRandomParticleStyle(index: number) {
    const randomSize = Math.floor(Math.random() * 5) + 3; // 3-7px
    const randomX = Math.floor(Math.random() * 100); // 0-100%
    const randomY = Math.floor(Math.random() * 100); // 0-100%
    const randomDelay = Math.random() * 2; // 0-2s
    const randomDuration = Math.floor(Math.random() * 20) + 10; // 10-30s
    
    return {
      width: `${randomSize}px`,
      height: `${randomSize}px`,
      left: `${randomX}%`,
      top: `${randomY}%`,
      borderRadius: '50%',
      animationDelay: `${randomDelay}s`,
      animationDuration: `${randomDuration}s`
    };
  }
}