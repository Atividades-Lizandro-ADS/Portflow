import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryPickerField } from './gallery-picker-field';

describe('GalleryPickerField', () => {
  let component: GalleryPickerField;
  let fixture: ComponentFixture<GalleryPickerField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryPickerField],
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryPickerField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
