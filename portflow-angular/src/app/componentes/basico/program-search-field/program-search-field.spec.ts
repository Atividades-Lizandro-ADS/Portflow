import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramSearchField } from './program-search-field';

describe('ProgramSearchField', () => {
  let component: ProgramSearchField;
  let fixture: ComponentFixture<ProgramSearchField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramSearchField],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramSearchField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
