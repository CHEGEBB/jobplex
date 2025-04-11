import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsExplorerComponent } from './jobs-explorer.component';

describe('JobsExplorerComponent', () => {
  let component: JobsExplorerComponent;
  let fixture: ComponentFixture<JobsExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobsExplorerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobsExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
