import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GrupoService } from '../../../core/services/grupo.service';
import { GrupoArbolItem, MiArbolResponse } from '../../../core/models/grupo.model';
import { GrupoFormComponent } from '../grupo-form/grupo-form.component';

@Component({
  selector: 'app-mi-arbol',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './mi-arbol.component.html',
  styleUrl: './mi-arbol.component.scss',
})
export class MiArbolComponent implements OnInit {
  private readonly grupoService = inject(GrupoService);
  private readonly router       = inject(Router);
  private readonly snackBar     = inject(MatSnackBar);
  private readonly dialog       = inject(MatDialog);
  readonly location             = inject(Location);

  readonly loading = signal(true);
  readonly arbol   = signal<MiArbolResponse | null>(null);

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.grupoService.getMiArbol().subscribe({
      next: data => { this.arbol.set(data); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar el árbol de células', 'Cerrar', { duration: 3000 });
      },
    });
  }

  nuevaSubCelula(grupoPadreId: string) {
    this.dialog.open(GrupoFormComponent, {
      width: '560px', disableClose: true,
      data: { grupoPadreId },
    }).afterClosed().subscribe(ok => ok && this.cargar());
  }

  verSesiones(item: GrupoArbolItem) {
    this.router.navigate(['/grupos', item.id, 'sesiones']);
  }

  indentPx(nivel: number): number {
    return 16 + nivel * 28;
  }

  formatPromedio(p: number | null): string {
    if (p == null) return '—';
    return p.toFixed(1);
  }
}
