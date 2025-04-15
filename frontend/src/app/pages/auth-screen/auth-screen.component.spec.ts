import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthScreenComponent } from './auth-screen.component';

describe('AuthScreenComponent', () => {
  let component: AuthScreenComponent;
  let fixture: ComponentFixture<AuthScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
