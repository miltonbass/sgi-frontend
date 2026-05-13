import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MemberService } from '../../../core/services/member.service';
import { AsistenciaMiembroResponse } from '../../../core/models/member.model';

@Component({
  selector: 'app-member-asistencia',
  standalone: true,
  imports: [
    DatePipe, DecimalPipe, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatTooltipModule,
    MatFormFieldModule, MatSelectModule, MatDividerModule,
  ],
  templateUrl: './member-asistencia.component.html',
  styleUrl: './member-asistencia.component.scss',
})
export class MemberAsistenciaComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly service = inject(MemberService);
  readonly location        = inject(Location);

  readonly loading = signal(true);
  readonly data    = signal<AsistenciaMiembroResponse | null>(null);

  readonly limiteCtrl = new FormControl<number>(20, { nonNullable: true });
  readonly opcLimite  = [10, 20, 50];

  private miembroId = '';

  readonly tipoEventoIcons: Record<string, string> = {
    CULTO: 'church', REUNION: 'groups', CONFERENCIA: 'mic', ESPECIAL: 'star',
  };
  readonly tipoEventoLabels: Record<string, string> = {
    CULTO: 'Culto', REUNION: 'Reunión', CONFERENCIA: 'Conferencia', ESPECIAL: 'Especial',
  };

  ngOnInit() {
    this.miembroId = this.route.snapshot.paramMap.get('id')!;
    this.cargar();
  }

  cargar() {
    this.loading.set(true);
    this.service.getAsistencia(this.miembroId, this.limiteCtrl.value).subscribe({
      next: d  => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  rachaColor(racha: number): 'verde' | 'rojo' | 'gris' {
    if (racha > 0) return 'verde';
    if (racha < 0) return 'rojo';
    return 'gris';
  }

  rachaIcon(racha: number): string {
    if (racha > 0) return 'trending_up';
    if (racha < 0) return 'trending_down';
    return 'remove';
  }

  porcentajeColor(pct: number): 'verde' | 'naranja' | 'rojo' {
    if (pct >= 75) return 'verde';
    if (pct >= 50) return 'naranja';
    return 'rojo';
  }
}
