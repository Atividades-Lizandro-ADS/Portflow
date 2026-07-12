import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BriefingCard } from './briefing-card';

describe('BriefingCard', () => {
  let component: BriefingCard;
  let fixture: ComponentFixture<BriefingCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BriefingCard],
    }).compileComponents();

    fixture = TestBed.createComponent(BriefingCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
