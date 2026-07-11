import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoPasteInput } from './no-paste-input';

describe('NoPasteInput', () => {
  let component: NoPasteInput;
  let fixture: ComponentFixture<NoPasteInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoPasteInput],
    }).compileComponents();

    fixture = TestBed.createComponent(NoPasteInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
