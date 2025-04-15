import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarEmployerComponent } from './sidebar-employer.component';

describe('SidebarEmployerComponent', () => {
  let component: SidebarEmployerComponent;
  let fixture: ComponentFixture<SidebarEmployerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarEmployerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarEmployerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
