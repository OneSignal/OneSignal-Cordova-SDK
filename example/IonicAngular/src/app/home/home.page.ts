import { Component } from '@angular/core';
import OneSignal from 'onesignal-cordova-plugin';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  externalId = '';

  constructor() {}

  login() {
    if (this.externalId) {
      OneSignal.login(this.externalId);
      console.log('OneSignal login called with:', this.externalId);
    }
  }
}
