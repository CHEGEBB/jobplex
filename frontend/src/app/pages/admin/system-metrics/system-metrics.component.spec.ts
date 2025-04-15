import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemMetricsComponent } from './system-metrics.component';

describe('SystemMetricsComponent', () => {
  let component: SystemMetricsComponent;
  let fixture: ComponentFixture<SystemMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
