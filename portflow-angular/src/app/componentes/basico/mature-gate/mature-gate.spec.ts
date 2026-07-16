import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatureGate } from './mature-gate';

describe('MatureGate', () => {
  let component: MatureGate;
  let fixture: ComponentFixture<MatureGate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatureGate],
    }).compileComponents();

    fixture = TestBed.createComponent(MatureGate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
