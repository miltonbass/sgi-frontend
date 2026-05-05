import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, PercentPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResumenService } from '../../../core/services/resumen.service';
import { ResumenAsistencia, ComparativaItem } from '../../../core/models/resumen.model';

@Component({
  selector: 'app-evento-resumen',
  standalone: true,
  imports: [
    DatePipe, PercentPipe,
    MatButtonModule, MatIconModule, MatDividerModule,
    MatProgressSpinnerModule, MatTooltipModule, MatTableModule,
  ],
  templateUrl: './evento-resumen.component.html',
  styleUrl: './evento-resumen.component.scss',
})
export class EventoResumenComponent implements OnInit {
  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);
  private readonly resumenService = inject(ResumenService);
  private readonly snackBar       = inject(MatSnackBar);

  readonly eventoId = this.route.snapshot.paramMap.get('id')!;

  readonly loading  = signal(false);
  readonly resumen  = signal<ResumenAsistencia | null>(null);
  readonly exportando = signal(false);

  readonly asistentesColumns = ['nombre', 'tipo', 'hora'];

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.resumenService.getResumen(this.eventoId).subscribe({
      next: r => { this.resumen.set(r); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar el resumen', 'Cerrar', { duration: 3000 });
      },
    });
  }

  exportar() {
    this.exportando.set(true);
    this.resumenService.exportar(this.eventoId).subscribe({
      next: blob => {
        const titulo = this.resumen()?.titulo ?? this.resumen()?.eventoTitulo ?? 'asistencia';
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${titulo}.xlsx`;
        a.click();
        URL.revokeObjectURL(a.href);
        this.exportando.set(false);
      },
      error: () => {
        this.exportando.set(false);
        this.snackBar.open('Error al exportar', 'Cerrar', { duration: 3000 });
      },
    });
  }

  maxComparativa(): number {
    const items = this.resumen()?.comparativa ?? [];
    if (items.length === 0) return 1;
    return Math.max(...items.map(i => i.totalPresentes), 1);
  }

  barWidth(item: ComparativaItem): string {
    return `${Math.round((item.totalPresentes / this.maxComparativa()) * 100)}%`;
  }

  esActual(item: ComparativaItem): boolean {
    return item.eventoId === this.eventoId;
  }

  getNombreAsistente(a: { nombres: string; apellidos: string | null }): string {
    return `${a.nombres} ${a.apellidos ?? ''}`.trim();
  }

  volver() { this.router.navigate(['/eventos']); }
}
