import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateMatchesComponent } from './candidate-matches.component';

describe('CandidateMatchesComponent', () => {
  let component: CandidateMatchesComponent;
  let fixture: ComponentFixture<CandidateMatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateMatchesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
