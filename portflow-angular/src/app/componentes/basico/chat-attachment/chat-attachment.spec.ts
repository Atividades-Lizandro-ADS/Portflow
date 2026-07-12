import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatAttachment } from './chat-attachment';

describe('ChatAttachment', () => {
  let component: ChatAttachment;
  let fixture: ComponentFixture<ChatAttachment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatAttachment],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatAttachment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
