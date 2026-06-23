import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Marmoviewer } from './marmoviewer';

describe('Marmoviewer', () => {
  let component: Marmoviewer;
  let fixture: ComponentFixture<Marmoviewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Marmoviewer],
    }).compileComponents();

    fixture = TestBed.createComponent(Marmoviewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
