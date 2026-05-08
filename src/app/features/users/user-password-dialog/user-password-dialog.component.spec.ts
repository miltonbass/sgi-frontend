import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { UserPasswordDialogComponent } from './user-password-dialog.component';
import { UserService } from '../../../core/services/user.service';
import { Usuario } from '../../../core/models/user.model';

const mockUsuario = {
  id: 'user-1',
  nombre: 'Carlos',
  apellido: 'Gomez',
  username: 'cgomez',
  email: 'cgomez@test.com',
} as Partial<Usuario>;

describe('UserPasswordDialogComponent', () => {
  let fixture: ComponentFixture<UserPasswordDialogComponent>;
  let component: UserPasswordDialogComponent;
  let userService: Record<string, ReturnType<typeof vi.fn>>;
  let dialogRef: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    userService = { resetPassword: vi.fn() };
    dialogRef   = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [UserPasswordDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: UserService,     useValue: userService },
        { provide: MatDialogRef,    useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockUsuario },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(UserPasswordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('genera contraseña inicial de al menos 8 caracteres', () => {
    expect(component.passwordCtrl.value!.length).toBeGreaterThanOrEqual(8);
  });

  it('el formulario es válido con la contraseña inicial', () => {
    expect(component.passwordCtrl.valid).toBe(true);
  });

  describe('generar()', () => {
    it('genera una nueva contraseña de al menos 8 caracteres', () => {
      const nueva = component.generar();
      expect(nueva.length).toBeGreaterThanOrEqual(8);
      expect(component.passwordCtrl.value).toBe(nueva);
    });

    it('resetea el estado de "copiado"', () => {
      component.copiado.set(true);
      component.generar();
      expect(component.copiado()).toBe(false);
    });
  });

  describe('guardar()', () => {
    it('llama a resetPassword con el id del usuario y la contraseña', () => {
      userService['resetPassword'].mockReturnValue(of(undefined));
      component.passwordCtrl.setValue('NuevaPass123!');

      component.guardar();

      expect(userService['resetPassword']).toHaveBeenCalledWith('user-1', 'NuevaPass123!');
    });

    it('cierra el dialog con true si la operación es exitosa', () => {
      userService['resetPassword'].mockReturnValue(of(undefined));
      component.guardar();
      expect(dialogRef['close']).toHaveBeenCalledWith(true);
    });

    it('muestra error y no cierra el dialog si el servicio falla', () => {
      userService['resetPassword'].mockReturnValue(
        throwError(() => ({ error: { mensaje: 'Contraseña inválida' } }))
      );
      component.guardar();
      expect(component.error()).toBe('Contraseña inválida');
      expect(dialogRef['close']).not.toHaveBeenCalled();
    });

    it('no llama al servicio si la contraseña es muy corta', () => {
      component.passwordCtrl.setValue('corta');
      component.guardar();
      expect(userService['resetPassword']).not.toHaveBeenCalled();
    });

    it('desactiva loading tras completar', () => {
      userService['resetPassword'].mockReturnValue(of(undefined));
      component.guardar();
      expect(component.loading()).toBe(false);
    });
  });

  describe('visibilidad de contraseña', () => {
    it('show inicia en false', () => {
      expect(component.show()).toBe(false);
    });

    it('toggle cambia show a true', () => {
      component.show.set(true);
      expect(component.show()).toBe(true);
    });
  });
});
