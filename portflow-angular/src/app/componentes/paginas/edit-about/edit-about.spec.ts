import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAbout } from './edit-about';

describe('EditAbout', () => {
  let component: EditAbout;
  let fixture: ComponentFixture<EditAbout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAbout],
    }).compileComponents();

    fixture = TestBed.createComponent(EditAbout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
