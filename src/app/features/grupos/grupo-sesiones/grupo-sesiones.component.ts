import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GrupoService } from '../../../core/services/grupo.service';
import { SesionGrupo } from '../../../core/models/sesion.model';

@Component({
  selector: 'app-grupo-sesiones',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule, MatCardModule, MatIconModule, MatTableModule,
    MatProgressSpinnerModule, MatTooltipModule, MatDividerModule,
  ],
  templateUrl: './grupo-sesiones.component.html',
  styleUrl: './grupo-sesiones.component.scss',
})
export class GrupoSesionesComponent implements OnInit {
  private readonly route        = inject(ActivatedRoute);
  private readonly router       = inject(Router);
  private readonly grupoService = inject(GrupoService);
  private readonly snackBar     = inject(MatSnackBar);
  readonly location             = inject(Location);

  readonly grupoId  = this.route.snapshot.paramMap.get('grupoId')!;
  readonly loading  = signal(true);
  readonly sesiones = signal<SesionGrupo[]>([]);
  readonly grupoNombre = signal('');

  readonly columns = ['fecha', 'lugar', 'tema', 'asistencia', 'acciones'];

  ngOnInit() {
    this.grupoService.getSesiones(this.grupoId).subscribe({
      next: list => {
        this.sesiones.set(list);
        if (list.length > 0) this.grupoNombre.set(list[0].grupoNombre);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar sesiones', 'Cerrar', { duration: 3000 });
      },
    });
  }

  verAsistencia(sesion: SesionGrupo) {
    this.router.navigate(
      ['/grupos', this.grupoId, 'sesiones', sesion.id, 'asistencia'],
      { queryParams: { soloLectura: '1' } },
    );
  }
}
