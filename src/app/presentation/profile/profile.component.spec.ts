// profile.component.spec.ts
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { AuthService } from 'src/app/application/services/auth/auth.service';
import { UserService } from 'src/app/application/services/user/user.service';
import { User } from 'src/app/core/models/user.model';
import { UserRole } from 'src/app/core/models/roles.enum';

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: UserRole.CLIENT,
  bio: 'Test bio',
  location: 'Test location',
  twoFactorEnabled: false,
};

const mockProfileResponse = {
  data: mockUser,
};

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let routerMock: any;
  let userServiceMock: any;
  let authServiceMock: any;
  let snackBarMock: any;
  let dialogMock: any;
  let currentUserSubject: BehaviorSubject<User>;

  beforeEach(async () => {
    // Mock del subject para currentUser$
    currentUserSubject = new BehaviorSubject<User>(mockUser);

    // Configurar mocks
    routerMock = {
      navigate: jest.fn(),
    };

    userServiceMock = {
      getProfile: jest.fn().mockReturnValue(of(mockProfileResponse)),
      updateTwoFactorAuth: jest.fn().mockReturnValue(of({})),
      downloadUserData: jest.fn().mockReturnValue(of({})),
      deleteAccount: jest.fn().mockReturnValue(of({})),
    };

    authServiceMock = {
      currentUser$: currentUserSubject.asObservable(),
      logout: jest.fn(),
    };

    snackBarMock = {
      open: jest.fn(),
    };

    dialogMock = {
      open: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      // Arrange & Act
      const newComponent = new ProfileComponent(
        routerMock,
        userServiceMock,
        authServiceMock,
        snackBarMock,
        dialogMock
      );

      // Assert
      expect(newComponent.isLoading).toBe(false);
      expect(newComponent.showStats).toBe(true);
      expect(newComponent.showQuickStats).toBe(true);
      expect(newComponent.showSecurityInfo).toBe(true);
      expect(newComponent.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('ngOnInit', () => {
    it('should call loadUserProfile on init', () => {
      // Arrange
      const loadUserProfileSpy = jest
        .spyOn(component, 'loadUserProfile')
        .mockImplementation(() => {});

      // Act
      component.ngOnInit();

      // Assert
      expect(loadUserProfileSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      // Arrange
      const destroySpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      // Act
      component.ngOnDestroy();

      // Assert
      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('loadUserProfile', () => {
    it('should load user profile successfully', fakeAsync(() => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      component.loadUserProfile();
      tick();

      // Assert
      expect(userServiceMock.getProfile).toHaveBeenCalledWith(mockUser.id);
      expect(component.user).toEqual(mockUser);
      expect(component.isLoading).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Perfil cargado:', mockUser);
    }));

    it('should handle error when loading profile', fakeAsync(() => {
      // Arrange
      const error = new Error('Profile error');
      userServiceMock.getProfile.mockReturnValue(throwError(() => error));
      const handleErrorSpy = jest
        .spyOn(component as any, 'handleError')
        .mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      component.loadUserProfile();
      tick();

      // Assert
      expect(component.isLoading).toBe(false);
      expect(handleErrorSpy).toHaveBeenCalledWith('Error al cargar el perfil');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading profile:',
        error
      );
    }));

    it('should handle error when user id is not found', () => {
      // Arrange
      currentUserSubject.next({ ...mockUser, id: '' } as User);
      const handleErrorSpy = jest
        .spyOn(component as any, 'handleError')
        .mockImplementation();

      // Act
      component.loadUserProfile();

      // Assert
      expect(handleErrorSpy).toHaveBeenCalledWith(
        'No se encontró información del usuario'
      );
      expect(userServiceMock.getProfile).not.toHaveBeenCalled();
    });
  });

  describe('reloadProfile', () => {
    it('should call loadUserProfile', () => {
      // Arrange
      const loadUserProfileSpy = jest
        .spyOn(component, 'loadUserProfile')
        .mockImplementation();

      // Act
      component.reloadProfile();

      // Assert
      expect(loadUserProfileSpy).toHaveBeenCalled();
    });
  });

  describe('editProfile', () => {
    it('should navigate to edit profile when user exists', () => {
      // Arrange
      component.user = mockUser;

      // Act
      component.editProfile();

      // Assert
      expect(routerMock.navigate).toHaveBeenCalledWith(['/profile/edit'], {
        queryParams: { id: mockUser.id },
      });
    });

    it('should not navigate when user does not exist', () => {
      // Arrange
      component.user = undefined;

      // Act
      component.editProfile();

      // Assert
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should navigate to change password page', () => {
      // Act
      component.changePassword();

      // Assert
      expect(routerMock.navigate).toHaveBeenCalledWith(['/change-password']);
    });
  });

  describe('toggleTwoFactor', () => {
    it('should call updateTwoFactorStatus when enabling two factor', () => {
      // Arrange
      component.user = mockUser;
      const updateTwoFactorStatusSpy = jest
        .spyOn(component as any, 'updateTwoFactorStatus')
        .mockImplementation();
      const event = { checked: true } as MatSlideToggleChange;

      // Act
      component.toggleTwoFactor(event);

      // Assert
      expect(updateTwoFactorStatusSpy).toHaveBeenCalledWith(true);
    });

    it('should call confirmTwoFactorToggle when disabling two factor', () => {
      // Arrange
      component.user = mockUser;
      const confirmTwoFactorToggleSpy = jest
        .spyOn(component as any, 'confirmTwoFactorToggle')
        .mockImplementation();
      const event = { checked: false } as MatSlideToggleChange;

      // Act
      component.toggleTwoFactor(event);

      // Assert
      expect(confirmTwoFactorToggleSpy).toHaveBeenCalledWith(false);
    });

    it('should return early when user does not exist', () => {
      // Arrange
      component.user = undefined;
      const updateTwoFactorStatusSpy = jest.spyOn(
        component as any,
        'updateTwoFactorStatus'
      );
      const event = { checked: true } as MatSlideToggleChange;

      // Act
      component.toggleTwoFactor(event);

      // Assert
      expect(updateTwoFactorStatusSpy).not.toHaveBeenCalled();
    });
  });

  describe('confirmTwoFactorToggle', () => {
    it('should call updateTwoFactorStatus when user confirms', () => {
      // Arrange
      component.user = mockUser;
      const updateTwoFactorStatusSpy = jest
        .spyOn(component as any, 'updateTwoFactorStatus')
        .mockImplementation();
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      // Act
      component['confirmTwoFactorToggle'](true);

      // Assert
      expect(updateTwoFactorStatusSpy).toHaveBeenCalledWith(true);
    });

    it('should toggle user.twoFactorEnabled when user cancels', fakeAsync(() => {
      // Arrange
      component.user = { ...mockUser, twoFactorEnabled: false };
      const updateTwoFactorStatusSpy = jest.spyOn(
        component as any,
        'updateTwoFactorStatus'
      );
      jest.spyOn(window, 'confirm').mockReturnValue(false);

      // Act
      component['confirmTwoFactorToggle'](true);
      tick();

      // Assert
      expect(updateTwoFactorStatusSpy).not.toHaveBeenCalled();
      expect(component.user!.twoFactorEnabled).toBe(false);
    }));
  });

  describe('exportProfile', () => {
    it('should export profile data successfully', () => {
      // Arrange
      component.user = mockUser;
      const downloadFileSpy = jest
        .spyOn(component as any, 'downloadFile')
        .mockImplementation();
      const showMessageSpy = jest
        .spyOn(component as any, 'showMessage')
        .mockImplementation();

      const expectedProfileData = {
        name: mockUser.name,
        email: mockUser.email,
        bio: mockUser.bio,
        location: mockUser.location,
      };

      // Act
      component.exportProfile();

      // Assert
      expect(downloadFileSpy).toHaveBeenCalledWith(
        JSON.stringify(expectedProfileData, null, 2),
        `profile-${mockUser.id}.json`
      );
      expect(showMessageSpy).toHaveBeenCalledWith(
        'Perfil exportado exitosamente'
      );
    });

    it('should return early when user does not exist', () => {
      // Arrange
      component.user = undefined;
      const downloadFileSpy = jest.spyOn(component as any, 'downloadFile');

      // Act
      component.exportProfile();

      // Assert
      expect(downloadFileSpy).not.toHaveBeenCalled();
    });
  });

  describe('deleteAccount', () => {
    it('should not proceed when user cancels confirmation', () => {
      // Arrange
      jest.spyOn(window, 'confirm').mockReturnValue(false);

      // Act
      component.deleteAccount();

      // Assert
      expect(window.confirm).toHaveBeenCalledWith(
        '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
      );
      // Note: The actual delete logic is commented out in the component
    });

    it('should show confirmation dialog', () => {
      // Arrange
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      // Act
      component.deleteAccount();

      // Assert
      expect(window.confirm).toHaveBeenCalledWith(
        '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
      );
    });
  });

  describe('showMessage', () => {
    it('should open snackbar with success configuration', () => {
      // Arrange
      const message = 'Test success message';

      // Act
      component['showMessage'](message);

      // Assert
      expect(snackBarMock.open).toHaveBeenCalledWith(message, 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    });
  });

  describe('handleError', () => {
    it('should open snackbar with error configuration', () => {
      // Arrange
      const message = 'Test error message';

      // Act
      component['handleError'](message);

      // Assert
      expect(snackBarMock.open).toHaveBeenCalledWith(message, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null user in toggleTwoFactor', () => {
      // Arrange
      component.user = null as any;
      const event = { checked: true } as MatSlideToggleChange;

      // Act & Assert (should not throw)
      expect(() => component.toggleTwoFactor(event)).not.toThrow();
    });

    it('should handle user without id in editProfile', () => {
      // Arrange
      component.user = { ...mockUser, id: undefined } as any;

      // Act
      component.editProfile();

      // Assert
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });
});
