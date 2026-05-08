import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AlertaService } from './alerta.service';
import { environment } from '../../../environments/environment';

describe('AlertaService', () => {
  let service: AlertaService;
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/v1/alertas`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AlertaService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('detectar()', () => {
    it('hace POST a /detectar', () => {
      service.detectar().subscribe();
      const req = http.expectOne(`${base}/detectar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({ alertasCreadas: 2, miembrosEvaluados: 10, umbralSemanas: 3 });
    });

    it('retorna DetectarResponse', () => {
      const mock = { alertasCreadas: 3, miembrosEvaluados: 15, umbralSemanas: 2 };
      service.detectar().subscribe(res => expect(res).toEqual(mock));
      http.expectOne(`${base}/detectar`).flush(mock);
    });
  });

  describe('getAll()', () => {
    it('GET sin parámetros', () => {
      service.getAll().subscribe();
      const req = http.expectOne(base);
      expect(req.request.method).toBe('GET');
      req.flush({ content: [], pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0 });
    });

    it('GET con estado PENDIENTE', () => {
      service.getAll({ estado: 'PENDIENTE' }).subscribe();
      const req = http.expectOne(r => r.url === base);
      expect(req.request.params.get('estado')).toBe('PENDIENTE');
      req.flush({ content: [], pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0 });
    });

    it('GET con paginación', () => {
      service.getAll({ page: 1, size: 10 }).subscribe();
      const req = http.expectOne(r => r.url === base);
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('size')).toBe('10');
      req.flush({ content: [], pageNumber: 1, pageSize: 10, totalElements: 0, totalPages: 0 });
    });

    it('GET con todos los parámetros', () => {
      service.getAll({ estado: 'GESTIONADA', page: 2, size: 5 }).subscribe();
      const req = http.expectOne(r => r.url === base);
      expect(req.request.params.get('estado')).toBe('GESTIONADA');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('size')).toBe('5');
      req.flush({ content: [], pageNumber: 2, pageSize: 5, totalElements: 0, totalPages: 0 });
    });
  });

  describe('gestionar()', () => {
    it('PATCH con notas incluye body { notas }', () => {
      service.gestionar('abc-123', 'Se contactó').subscribe();
      const req = http.expectOne(`${base}/abc-123/gestionar`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ notas: 'Se contactó' });
      req.flush({});
    });

    it('PATCH sin notas envía body vacío', () => {
      service.gestionar('abc-123').subscribe();
      const req = http.expectOne(`${base}/abc-123/gestionar`);
      expect(req.request.body).toEqual({});
      req.flush({});
    });
  });

  describe('descartar()', () => {
    it('PATCH con notas incluye body { notas }', () => {
      service.descartar('xyz-456', 'De viaje').subscribe();
      const req = http.expectOne(`${base}/xyz-456/descartar`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ notas: 'De viaje' });
      req.flush({});
    });

    it('PATCH sin notas envía body vacío', () => {
      service.descartar('xyz-456').subscribe();
      const req = http.expectOne(`${base}/xyz-456/descartar`);
      expect(req.request.body).toEqual({});
      req.flush({});
    });
  });

  describe('configuración()', () => {
    it('getConfiguracion() hace GET a /configuracion', () => {
      service.getConfiguracion().subscribe();
      const req = http.expectOne(`${base}/configuracion`);
      expect(req.request.method).toBe('GET');
      req.flush({ umbralSemanas: 3 });
    });

    it('updateConfiguracion() hace PATCH con umbralSemanas', () => {
      service.updateConfiguracion(4).subscribe();
      const req = http.expectOne(`${base}/configuracion`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ umbralSemanas: 4 });
      req.flush({ umbralSemanas: 4 });
    });
  });
});
