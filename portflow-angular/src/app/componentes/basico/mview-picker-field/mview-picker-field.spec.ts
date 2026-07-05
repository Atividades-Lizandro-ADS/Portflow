import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MviewPickerField } from './mview-picker-field';

describe('MviewPickerField', () => {
  let component: MviewPickerField;
  let fixture: ComponentFixture<MviewPickerField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MviewPickerField],
    }).compileComponents();

    fixture = TestBed.createComponent(MviewPickerField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
