import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishToggle } from './publish-toggle';

describe('PublishToggle', () => {
  let component: PublishToggle;
  let fixture: ComponentFixture<PublishToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishToggle],
    }).compileComponents();

    fixture = TestBed.createComponent(PublishToggle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
