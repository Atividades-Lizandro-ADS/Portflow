import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierCards } from './tier-cards';

describe('TierCards', () => {
  let component: TierCards;
  let fixture: ComponentFixture<TierCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TierCards],
    }).compileComponents();

    fixture = TestBed.createComponent(TierCards);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
