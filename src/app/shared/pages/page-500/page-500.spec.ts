import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Page500 } from './page-500';

describe('Page500', () => {
  let component: Page500;
  let fixture: ComponentFixture<Page500>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Page500]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Page500);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
