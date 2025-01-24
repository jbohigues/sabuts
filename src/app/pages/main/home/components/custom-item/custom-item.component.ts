import { Component, Input, OnInit } from '@angular/core';
import { IonText, IonLabel, IonImg } from '@ionic/angular/standalone';

@Component({
  selector: 'app-custom-item',
  templateUrl: './custom-item.component.html',
  styleUrls: ['./custom-item.component.scss'],
  standalone: true,
  imports: [IonText, IonLabel],
})
export class CustomItemComponent implements OnInit {
  @Input() alt!: string;
  @Input() src!: string;
  @Input() h2!: string;
  @Input() p!: string;
  constructor() {}

  ngOnInit() {}
}
