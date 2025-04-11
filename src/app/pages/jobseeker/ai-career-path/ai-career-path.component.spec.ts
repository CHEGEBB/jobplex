import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiCareerPathComponent } from './ai-career-path.component';

describe('AiCareerPathComponent', () => {
  let component: AiCareerPathComponent;
  let fixture: ComponentFixture<AiCareerPathComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiCareerPathComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiCareerPathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
