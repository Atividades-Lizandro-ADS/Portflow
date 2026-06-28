import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryLightbox } from './gallery-lightbox';

describe('GalleryLightbox', () => {
  let component: GalleryLightbox;
  let fixture: ComponentFixture<GalleryLightbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryLightbox],
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryLightbox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
