import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FriendsSearchPage } from './friends-search.page';

describe('FriendsSearchPage', () => {
  let component: FriendsSearchPage;
  let fixture: ComponentFixture<FriendsSearchPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendsSearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
