import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayingGamePage } from './playing-game.page';

describe('PlayingGamePage', () => {
  let component: PlayingGamePage;
  let fixture: ComponentFixture<PlayingGamePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayingGamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
