import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ResumenService } from './resumen.service';
import { environment } from '../../../environments/environment';
import { ResumenAsistencia } from '../models/resumen.model';

const mockResumen: ResumenAsistencia = {
  eventoId: 'ev-1',
  titulo: 'Culto dominical',
  tipo: 'CULTO',
  fechaInicio: '2026-05-05T10:00:00Z',
  lugar: 'Auditorio principal',
  capacidad: 200,
  totalPresentes: 120,
  porcentajeCapacidad: 0.6,
  primerasVisitas: 5,
  miembrosActivos: 100,
  otrosAsistentes: 20,
  asistentes: [],
  comparativa: [],
};

describe('ResumenService', () => {
  let service: ResumenService;
  let http: HttpTestingController;

  const urlResumen = (id: string) => `${environment.apiUrl}/v1/eventos/${id}/resumen`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ResumenService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('getResumen()', () => {
    it('hace GET al endpoint correcto', () => {
      service.getResumen('ev-1').subscribe();
      const req = http.expectOne(urlResumen('ev-1'));
      expect(req.request.method).toBe('GET');
      req.flush(mockResumen);
    });

    it('retorna el ResumenAsistencia del servidor', () => {
      service.getResumen('ev-1').subscribe(res => {
        expect(res.totalPresentes).toBe(120);
        expect(res.miembrosActivos).toBe(100);
        expect(res.primerasVisitas).toBe(5);
      });
      http.expectOne(urlResumen('ev-1')).flush(mockResumen);
    });
  });

  describe('exportar()', () => {
    it('hace GET al endpoint de exportación como blob', () => {
      service.exportar('ev-1').subscribe();
      const req = http.expectOne(`${urlResumen('ev-1')}/exportar`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(new Blob());
    });
  });
});
