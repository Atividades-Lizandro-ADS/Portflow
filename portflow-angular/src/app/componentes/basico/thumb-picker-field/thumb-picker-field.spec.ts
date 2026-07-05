import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbPickerField } from './thumb-picker-field';

describe('ThumbPickerField', () => {
  let component: ThumbPickerField;
  let fixture: ComponentFixture<ThumbPickerField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThumbPickerField],
    }).compileComponents();

    fixture = TestBed.createComponent(ThumbPickerField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
