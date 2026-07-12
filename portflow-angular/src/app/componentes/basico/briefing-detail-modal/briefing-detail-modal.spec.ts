import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BriefingDetailModal } from './briefing-detail-modal';

describe('BriefingDetailModal', () => {
  let component: BriefingDetailModal;
  let fixture: ComponentFixture<BriefingDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BriefingDetailModal],
    }).compileComponents();

    fixture = TestBed.createComponent(BriefingDetailModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
