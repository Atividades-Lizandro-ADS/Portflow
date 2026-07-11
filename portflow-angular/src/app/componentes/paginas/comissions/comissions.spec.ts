import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Comissions } from './comissions';

describe('Comissions', () => {
  let component: Comissions;
  let fixture: ComponentFixture<Comissions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Comissions],
    }).compileComponents();

    fixture = TestBed.createComponent(Comissions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
