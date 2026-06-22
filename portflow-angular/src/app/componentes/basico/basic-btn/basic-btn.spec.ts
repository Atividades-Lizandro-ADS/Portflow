import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicBtn } from './basic-btn';

describe('BasicBtn', () => {
  let component: BasicBtn;
  let fixture: ComponentFixture<BasicBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicBtn],
    }).compileComponents();

    fixture = TestBed.createComponent(BasicBtn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
