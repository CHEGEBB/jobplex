import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiMonitoringComponent } from './ai-monitoring.component';

describe('AiMonitoringComponent', () => {
  let component: AiMonitoringComponent;
  let fixture: ComponentFixture<AiMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiMonitoringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
