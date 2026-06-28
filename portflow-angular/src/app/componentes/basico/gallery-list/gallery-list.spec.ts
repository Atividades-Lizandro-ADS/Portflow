import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryList } from './gallery-list';

describe('GalleryList', () => {
  let component: GalleryList;
  let fixture: ComponentFixture<GalleryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryList],
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
