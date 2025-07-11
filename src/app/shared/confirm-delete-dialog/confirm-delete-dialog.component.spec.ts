import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ConfirmDeleteDialogComponent,
  ConfirmDeleteDialogData,
} from './confirm-delete-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ConfirmDeleteDialogComponent (Jest)', () => {
  let component: ConfirmDeleteDialogComponent;
  let fixture: ComponentFixture<ConfirmDeleteDialogComponent>;

  const mockDialogRef = {
    close: jest.fn(),
  };

  const mockData: ConfirmDeleteDialogData = {
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de eliminar este elemento?',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
  };

  beforeEach(async () => {
    // Arrange
    await TestBed.configureTestingModule({
      declarations: [ConfirmDeleteDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
      schemas: [NO_ERRORS_SCHEMA], // Ignorar HTML de Material si no se prueba la plantilla
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create the component', () => {
    // Assert
    expect(component).toBeTruthy();
  });

  test('should close the dialog with false when onCancel is called', () => {
    // Act
    component.onCancel();

    // Assert
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  test('should close the dialog with true when onConfirm is called', () => {
    // Act
    component.onConfirm();

    // Assert
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  test('should receive the injected data correctly', () => {
    // Assert
    expect(component.data).toEqual(mockData);
    expect(component.data.title).toBe('Confirmar eliminación');
    expect(component.data.message).toBe(
      '¿Estás seguro de eliminar este elemento?'
    );
    expect(component.data.confirmText).toBe('Eliminar');
    expect(component.data.cancelText).toBe('Cancelar');
  });
});
