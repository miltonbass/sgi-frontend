import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertasComponent } from './alertas.component';
import { AlertaService } from '../../core/services/alerta.service';
import { AuthService } from '../../core/services/auth.service';
import { AlertaEstado, AlertaResponse } from '../../core/models/alerta.model';

const mockAlerta: AlertaResponse = {
  id: 'alerta-1',
  miembroId: 'mid-1',
  miembroNombres: 'Laura',
  miembroApellidos: 'Sanchez',
  miembroTelefono: '3100000000',
  consolidadorId: 'cid-1',
  consolidadorNombres: 'Pedro',
  consolidadorApellidos: 'Ramirez',
  semanasAusente: 3,
  estado: 'PENDIENTE',
  notas: null,
  creadoEn: '2026-05-01T00:00:00Z',
  gestionadaEn: null,
};

const mockPage = {
  content: [mockAlerta],
  pageNumber: 0,
  pageSize: 20,
  totalElements: 1,
  totalPages: 1,
};

describe('AlertasComponent', () => {
  let fixture: ComponentFixture<AlertasComponent>;
  let component: AlertasComponent;
  let alertaService: Record<string, ReturnType<typeof vi.fn>>;
  let dialog: Record<string, ReturnType<typeof vi.fn>>;
  let snackBar: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    alertaService = {
      detectar:             vi.fn().mockReturnValue(of({ alertasCreadas: 1, miembrosEvaluados: 5, umbralSemanas: 3 })),
      getAll:               vi.fn().mockReturnValue(of(mockPage)),
      gestionar:            vi.fn(),
      descartar:            vi.fn(),
      getConfiguracion:     vi.fn().mockReturnValue(of({ umbralSemanas: 3 })),
      updateConfiguracion:  vi.fn(),
    };

    dialog   = { open: vi.fn() };
    snackBar = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AlertasComponent, NoopAnimationsModule],
      providers: [
        { provide: AlertaService, useValue: alertaService },
        { provide: MatDialog,     useValue: dialog },
        { provide: MatSnackBar,   useValue: snackBar },
        {
          provide: AuthService,
          useValue: {
            hasAnyRole:      (roles: string[]) => roles.includes('ADMIN_GLOBAL'),
            hasRole:         () => true,
            currentUser:     signal({ id: '1', email: 'admin@test.com', roles: ['ADMIN_GLOBAL'], sedeActiva: 'PAI_BOG', sedeSchema: 'sede_test', sedes: [] }),
            isAuthenticated: signal(true),
          },
        },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(AlertasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('carga la configuración y establece el umbral', () => {
      expect(alertaService['getConfiguracion']).toHaveBeenCalled();
      expect(component.umbral()).toBe(3);
    });

    it('ejecuta detección antes de cargar', () => {
      expect(alertaService['detectar']).toHaveBeenCalled();
      expect(alertaService['getAll']).toHaveBeenCalled();
    });

    it('carga alertas PENDIENTE por defecto', () => {
      expect(alertaService['getAll']).toHaveBeenCalledWith(expect.objectContaining({ estado: 'PENDIENTE' }));
      expect(component.alertas()).toEqual([mockAlerta]);
      expect(component.total()).toBe(1);
    });
  });

  describe('filtrar()', () => {
    it('cambia el estado activo y recarga', () => {
      component.filtrar('GESTIONADA');
      expect(component.estadoActivo()).toBe('GESTIONADA');
      expect(alertaService['getAll']).toHaveBeenCalledWith(expect.objectContaining({ estado: 'GESTIONADA' }));
    });

    it('resetea la página al filtrar', () => {
      component.pageIndex.set(2);
      component.filtrar('DESCARTADA');
      expect(component.pageIndex()).toBe(0);
    });
  });

  describe('gestionar()', () => {
    it('abre el diálogo de confirmación', () => {
      dialog['open'].mockReturnValue({ afterClosed: () => of({ confirmed: false }) });
      component.gestionar(mockAlerta);
      expect(dialog['open']).toHaveBeenCalled();
    });

    it('llama al servicio con notas si el usuario confirma', () => {
      alertaService['gestionar'].mockReturnValue(of({ ...mockAlerta, estado: 'GESTIONADA' as AlertaEstado }));
      dialog['open'].mockReturnValue({ afterClosed: () => of({ confirmed: true, inputValue: 'nota de prueba' }) });

      component.gestionar(mockAlerta);

      expect(alertaService['gestionar']).toHaveBeenCalledWith('alerta-1', 'nota de prueba');
    });

    it('envía undefined como notas si el input está vacío', () => {
      alertaService['gestionar'].mockReturnValue(of({ ...mockAlerta, estado: 'GESTIONADA' as AlertaEstado }));
      dialog['open'].mockReturnValue({ afterClosed: () => of({ confirmed: true, inputValue: '' }) });

      component.gestionar(mockAlerta);

      expect(alertaService['gestionar']).toHaveBeenCalledWith('alerta-1', undefined);
    });

    it('NO llama al servicio si se cancela el diálogo', () => {
      dialog['open'].mockReturnValue({ afterClosed: () => of({ confirmed: false }) });
      component.gestionar(mockAlerta);
      expect(alertaService['gestionar']).not.toHaveBeenCalled();
    });

    it('muestra snackbar de error si el servicio falla', () => {
      alertaService['gestionar'].mockReturnValue(throwError(() => new Error()));
      dialog['open'].mockReturnValue({ afterClosed: () => of({ confirmed: true, inputValue: '' }) });

      component.gestionar(mockAlerta);

      expect(snackBar['open']).toHaveBeenCalledWith('Error al gestionar la alerta', 'Cerrar', expect.any(Object));
    });
  });

  describe('descartar()', () => {
    it('llama al servicio con notas si el usuario confirma', () => {
      alertaService['descartar'].mockReturnValue(of({ ...mockAlerta, estado: 'DESCARTADA' as AlertaEstado }));
      dialog['open'].mockReturnValue({ afterClosed: () => of({ confirmed: true, inputValue: 'de viaje' }) });

      component.descartar(mockAlerta);

      expect(alertaService['descartar']).toHaveBeenCalledWith('alerta-1', 'de viaje');
    });

    it('NO llama al servicio si se cancela', () => {
      dialog['open'].mockReturnValue({ afterClosed: () => of({ confirmed: false }) });
      component.descartar(mockAlerta);
      expect(alertaService['descartar']).not.toHaveBeenCalled();
    });
  });

  describe('guardarUmbral()', () => {
    it('llama al servicio y actualiza el umbral local', () => {
      alertaService['updateConfiguracion'].mockReturnValue(of({ umbralSemanas: 5 }));
      component.umbralCtrl.setValue(5);

      component.guardarUmbral();

      expect(alertaService['updateConfiguracion']).toHaveBeenCalledWith(5);
      expect(component.umbral()).toBe(5);
      expect(component.editandoUmbral()).toBe(false);
    });

    it('no llama al servicio si el umbral es inválido (< 1)', () => {
      component.umbralCtrl.setValue(0);
      component.guardarUmbral();
      expect(alertaService['updateConfiguracion']).not.toHaveBeenCalled();
    });
  });

  describe('getNombreConsolidador()', () => {
    it('retorna nombre completo si hay consolidador', () => {
      expect(component.getNombreConsolidador(mockAlerta)).toBe('Pedro Ramirez');
    });

    it('retorna texto por defecto si no hay consolidador', () => {
      expect(component.getNombreConsolidador({ ...mockAlerta, consolidadorId: null })).toBe('Sin consolidador asignado');
    });
  });

  describe('isAdminSede', () => {
    it('retorna true para ADMIN_GLOBAL', () => {
      expect(component.isAdminSede).toBe(true);
    });
  });
});
