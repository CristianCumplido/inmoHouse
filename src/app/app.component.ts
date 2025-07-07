import { Component } from '@angular/core';
import { LoadingService } from './application/services/loading/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'inmoHouse';
  constructor(public loadingService: LoadingService) {}
}
