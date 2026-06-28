import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostGallery } from './post-gallery';

describe('PostGallery', () => {
  let component: PostGallery;
  let fixture: ComponentFixture<PostGallery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostGallery],
    }).compileComponents();

    fixture = TestBed.createComponent(PostGallery);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
