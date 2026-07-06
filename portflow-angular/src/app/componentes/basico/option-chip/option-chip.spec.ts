import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionChip } from './option-chip';

describe('OptionChip', () => {
  let component: OptionChip;
  let fixture: ComponentFixture<OptionChip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptionChip],
    }).compileComponents();

    fixture = TestBed.createComponent(OptionChip);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
