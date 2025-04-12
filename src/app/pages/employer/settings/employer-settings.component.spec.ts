import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerSettingsComponent } from './employer-settings.component';

describe('SettingsComponent', () => {
  let component: EmployerSettingsComponent;
  let fixture: ComponentFixture<EmployerSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployerSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployerSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
