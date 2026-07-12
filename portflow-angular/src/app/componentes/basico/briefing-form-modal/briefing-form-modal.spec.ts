import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BriefingFormModal } from './briefing-form-modal';

describe('BriefingFormModal', () => {
  let component: BriefingFormModal;
  let fixture: ComponentFixture<BriefingFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BriefingFormModal],
    }).compileComponents();

    fixture = TestBed.createComponent(BriefingFormModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
