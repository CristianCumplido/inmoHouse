// profile.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/application/services/auth/auth.service';
import { UserService } from 'src/app/application/services/user/user.service';

// Mocks
const mockRouter = { navigate: jest.fn() };
const mockSnackBar = { open: jest.fn() };
const mockDialog = { open: jest.fn() };
const mockUserService = {
  getProfile: jest.fn(),
};
const mockAuthService = {
  currentUser$: of({ id: '123', name: 'Test User' }),
};

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MatDialog, useValue: mockDialog },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    // Return a mock observable before component init
    mockUserService.getProfile.mockReturnValue(
      of({ data: { id: '123', name: 'Mocked User' } })
    );

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => jest.clearAllMocks());

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load user profile on init', () => {
    expect(component.user).toEqual({ id: '123', name: 'Mocked User' });
    expect(component.isLoading).toBe(false);
  });

  it('should handle error if no user id is present', () => {
    const spy = jest.spyOn(component as any, 'handleError');
    (mockAuthService.currentUser$ as any) = of({});
    component.loadUserProfile();
    expect(spy).toHaveBeenCalledWith('No se encontró información del usuario');
  });

  it('should navigate to edit profile page', () => {
    component.user = { id: '123', name: 'Edit Me' } as any;
    component.editProfile();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile/edit'], {
      queryParams: { id: '123' },
    });
  });

  it('should navigate to change-password page', () => {
    component.changePassword();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/change-password']);
  });

  it('should show confirmation dialog when disabling 2FA', () => {
    window.confirm = jest.fn(() => true);
    component.user = { id: '123', twoFactorEnabled: true } as any;
    const toggleEvent = { checked: false } as any;
    const spy = jest.spyOn<any, any>(component, 'updateTwoFactorStatus');
    component.toggleTwoFactor(toggleEvent);
    expect(spy).toHaveBeenCalledWith(false);
  });

  // it('should export profile data and trigger download', () => {
  //   component.user = {
  //     id: '123',
  //     name: 'Test User',
  //     email: 'test@example.com',
  //     bio: 'Test bio',
  //     location: 'Colombia',
  //   } as any;
  //   const downloadSpy = jest.spyOn<any, any>(component, 'downloadFile');
  //   component.exportProfile();
  //   expect(downloadSpy).toHaveBeenCalled();
  // });

  it('should show success message', () => {
    component['showMessage']('Hello');
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Hello',
      'Cerrar',
      expect.any(Object)
    );
  });

  it('should show error message', () => {
    component['handleError']('Fail');
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Fail',
      'Cerrar',
      expect.any(Object)
    );
  });
});
