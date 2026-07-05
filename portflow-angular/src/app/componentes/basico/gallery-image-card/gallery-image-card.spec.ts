import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryImageCard } from './gallery-image-card';

describe('GalleryImageCard', () => {
  let component: GalleryImageCard;
  let fixture: ComponentFixture<GalleryImageCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryImageCard],
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryImageCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
