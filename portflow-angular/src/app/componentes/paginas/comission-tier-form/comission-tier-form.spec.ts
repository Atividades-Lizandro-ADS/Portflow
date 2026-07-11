import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComissionTierForm } from './comission-tier-form';

describe('ComissionTierForm', () => {
  let component: ComissionTierForm;
  let fixture: ComponentFixture<ComissionTierForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComissionTierForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ComissionTierForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
