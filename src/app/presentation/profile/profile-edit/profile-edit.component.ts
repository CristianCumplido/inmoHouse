import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/application/services/user/user.service';
import { AuthService } from 'src/app/application/services/auth/auth.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  user?: User;
  isLoading = false;
  currentImageUrl?: string;
  selectedFile?: File;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      bio: [''],
      location: [''],
      department: [''],
      linkedin: [''],
      twitter: [''],
      github: [''],
      website: [''],
    });
  }

  private loadUserData(): void {
    const currentUser = this.authService.getUser();
    if (!currentUser?.id) {
      this.router.navigate(['/profile']);
      return;
    }

    this.isLoading = true;

    this.userService
      .getProfile(currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.user = response.data;
          this.populateForm();
          this.currentImageUrl = this.user!.profileImage;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.isLoading = false;
          this.showError('Error al cargar el perfil');
          console.error('Error loading profile:', error);
        },
      });
  }

  private populateForm(): void {
    if (!this.user) return;

    this.profileForm.patchValue({
      name: this.user.name || '',
      email: this.user.email || '',
      phone: this.user.phone || '',
      bio: this.user.bio || '',
      location: this.user.location || '',
      department: this.user.department || '',
      linkedin: this.user.socialLinks?.linkedin || '',
      twitter: this.user.socialLinks?.twitter || '',
      github: this.user.socialLinks?.github || '',
      website: this.user.socialLinks?.website || '',
    });
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;

      // Preview the selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.currentImageUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.user?.id) return;

    this.isLoading = true;
    const formData = this.profileForm.value;

    // Prepare update data
    const updateData: Partial<User> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      location: formData.location,
      department: formData.department,
      socialLinks: {
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        github: formData.github,
        website: formData.website,
      },
    };

    // Update profile
    // this.userService
    //   .updateProfile(this.user.id, updateData)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (response:any) => {
    //       this.user = response.data;
    //       this.uploadImageIfSelected();
    //     },
    //     error: (error:any) => {
    //       this.isLoading = false;
    //       this.showError('Error al actualizar el perfil');
    //       console.error('Error updating profile:', error);
    //     },
    //   });
  }

  private uploadImageIfSelected(): void {
    // if (this.selectedFile && this.user?.id) {
    //   this.userService
    //     .uploadProfileImage(this.user.id, this.selectedFile)
    //     .pipe(takeUntil(this.destroy$))
    //     .subscribe({
    //       next: (response:any) => {
    //         this.currentImageUrl = response.imageUrl;
    //         this.finishUpdate();
    //       },
    //       error: (error:any) => {
    //         console.error('Error uploading image:', error);
    //         this.finishUpdate(); // Continue even if image upload fails
    //       },
    //     });
    // } else {
    //   this.finishUpdate();
    // }
  }

  private finishUpdate(): void {
    this.isLoading = false;
    this.showSuccess('Perfil actualizado exitosamente');
    this.router.navigate(['/profile']);
  }

  onCancel(): void {
    this.router.navigate(['/profile']);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}
