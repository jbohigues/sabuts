import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MainLayoutPage } from './main-layout.page';

describe('MainLayoutPage', () => {
  let component: MainLayoutPage;
  let fixture: ComponentFixture<MainLayoutPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainLayoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
