import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachMenu } from './attach-menu';

describe('AttachMenu', () => {
  let component: AttachMenu;
  let fixture: ComponentFixture<AttachMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttachMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(AttachMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
