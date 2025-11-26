import { Component } from '@angular/core';
import OneSignal, { LogLevel } from 'onesignal-cordova-plugin';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor() {
    this.initializeOneSignal();
  }

  private initializeOneSignal() {
    const APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef'; // Use your app ID
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(APP_ID);
    OneSignal.login('ionic-angular-8');
  }
}
