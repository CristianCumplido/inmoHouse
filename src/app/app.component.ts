import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoadingService } from './application/services/loading/loading.service';
import { Subject, takeUntil } from 'rxjs';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'inmoHouse';
  isIframe = false;
  loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();
  constructor(
    public loadingService: LoadingService,
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {}
  ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;
    this.setLoginDisplay();

    this.msalBroadcastService.inProgress$
      .pipe(takeUntil(this._destroying$))
      .subscribe((status: InteractionStatus) => {
        if (status === InteractionStatus.None) {
          this.setLoginDisplay();
        }
      });
  }

  setLoginDisplay() {
    this.loginDisplay = this.msalService.instance.getAllAccounts().length > 0;
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
