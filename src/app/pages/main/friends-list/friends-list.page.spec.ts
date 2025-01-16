import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FriendsListPage } from './friends-list.page';

describe('FriendsListPage', () => {
  let component: FriendsListPage;
  let fixture: ComponentFixture<FriendsListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
