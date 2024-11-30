import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/angular/standalone';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [IonFab, IonFabButton, IonIcon],
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss'],
})
export class ScrollToTopComponent {
  @Input() content!: IonContent;
  @Input() show = false;
  @Output() scrollToTopEmitter = new EventEmitter<void>();
  showButton = false;

  constructor() {}

  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.showButton = scrollTop > 100;
  }

  scrollToTop() {
    this.content.scrollToTop(500);
  }

  onScrollToTop() {
    this.scrollToTopEmitter.emit();
  }
}
