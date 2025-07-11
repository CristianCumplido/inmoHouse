import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { LoadingService } from './application/services/loading/loading.service';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { of, Subject } from 'rxjs';
import { InteractionStatus } from '@azure/msal-browser';

// Mocks
const mockLoadingService = {
  // Puedes agregar propiedades si necesitas testear loading
};

const mockMsalService = {
  instance: {
    getAllAccounts: jest.fn().mockReturnValue([]), // Default: sin login
  },
};

const inProgressSubject = new Subject<InteractionStatus>();
const mockMsalBroadcastService = {
  inProgress$: inProgressSubject.asObservable(),
};

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: MsalService, useValue: mockMsalService },
        { provide: MsalBroadcastService, useValue: mockMsalBroadcastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should set isIframe on init', () => {
    // Act
    component.ngOnInit();

    // Assert
    expect(component.isIframe).toBe(false);
  });

  it('should set loginDisplay to false if no accounts', () => {
    // Arrange
    mockMsalService.instance.getAllAccounts.mockReturnValue([]);

    // Act
    component.setLoginDisplay();

    // Assert
    expect(component.loginDisplay).toBe(false);
  });

  it('should set loginDisplay to true if accounts exist', () => {
    // Arrange
    mockMsalService.instance.getAllAccounts.mockReturnValue([
      { username: 'test' },
    ]);

    // Act
    component.setLoginDisplay();

    // Assert
    expect(component.loginDisplay).toBe(true);
  });

  it('should update loginDisplay when inProgress$ emits InteractionStatus.None', () => {
    // Arrange
    mockMsalService.instance.getAllAccounts.mockReturnValue([
      { username: 'test' },
    ]);
    component.ngOnInit();

    // Act
    inProgressSubject.next(InteractionStatus.None);

    // Assert (async flush)
    expect(component.loginDisplay).toBe(true);
  });

  it('should complete _destroying$ on ngOnDestroy', () => {
    // Arrange
    const spy = jest.spyOn(component['_destroying$'], 'next');

    // Act
    component.ngOnDestroy();

    // Assert
    expect(spy).toHaveBeenCalledWith(undefined);
  });
});
