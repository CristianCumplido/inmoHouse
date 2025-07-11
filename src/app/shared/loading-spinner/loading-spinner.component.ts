import { Component } from '@angular/core';
import { LoadingService } from 'src/app/application/services/loading/loading.service'; // ajusta el path según tu estructura

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
})
export class LoadingSpinnerComponent {
  loading$ = this.loadingService.loading$;

  constructor(private loadingService: LoadingService) {}
}
