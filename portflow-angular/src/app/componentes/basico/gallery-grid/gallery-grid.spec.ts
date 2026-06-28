import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryGrid } from './gallery-grid';

describe('GalleryGrid', () => {
  let component: GalleryGrid;
  let fixture: ComponentFixture<GalleryGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
