import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobseekerProfileComponent } from './jobseeker-profile.component';

describe('JobseekerProfileComponent', () => {
  let component: JobseekerProfileComponent;
  let fixture: ComponentFixture<JobseekerProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobseekerProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobseekerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
