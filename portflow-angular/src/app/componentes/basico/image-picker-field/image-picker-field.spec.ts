import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagePickerField } from './image-picker-field';

describe('ImagePickerField', () => {
  let component: ImagePickerField;
  let fixture: ComponentFixture<ImagePickerField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImagePickerField],
    }).compileComponents();

    fixture = TestBed.createComponent(ImagePickerField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
