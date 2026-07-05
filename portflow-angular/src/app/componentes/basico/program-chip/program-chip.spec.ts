import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramChip } from './program-chip';

describe('ProgramChip', () => {
  let component: ProgramChip;
  let fixture: ComponentFixture<ProgramChip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramChip],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramChip);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
