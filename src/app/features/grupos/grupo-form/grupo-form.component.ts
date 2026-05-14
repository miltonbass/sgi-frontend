import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { GrupoService } from '../../../core/services/grupo.service';
import { MemberService } from '../../../core/services/member.service';
import { AuthService } from '../../../core/services/auth.service';
import { Grupo, TipoGrupo, TIPO_GRUPO_LABELS, MiembroGrupo } from '../../../core/models/grupo.model';
import { Miembro } from '../../../core/models/member.model';

@Component({
  selector: 'app-grupo-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatAutocompleteModule,
    MatButtonModule, MatProgressSpinnerModule, MatIconModule,
  ],
  templateUrl: './grupo-form.component.html',
})
export class GrupoFormComponent implements OnInit {
  private readonly fb           = inject(FormBuilder);
  private readonly grupoService = inject(GrupoService);
  private readonly memberService = inject(MemberService);
  private readonly auth         = inject(AuthService);
  private readonly dialogRef    = inject(MatDialogRef<GrupoFormComponent>);
  readonly data: Grupo | null   = inject(MAT_DIALOG_DATA);

  readonly loading          = signal(false);
  readonly error            = signal('');
  readonly isEdit           = !!(this.data as Grupo)?.id;
  readonly grupoPadreId     = (this.data as any)?.grupoPadreId as string | undefined;
  readonly liderOpciones    = signal<Miembro[]>([]);
  readonly miembrosGrupo    = signal<MiembroGrupo[]>([]);
  readonly tipos            = Object.keys(TIPO_GRUPO_LABELS) as TipoGrupo[];
  readonly tipoLabels       = TIPO_GRUPO_LABELS;

  get isLiderCelula() {
    return this.auth.hasRole('LIDER_CELULA') && !this.auth.hasAnyRole(['ADMIN_SEDE', 'PASTOR_SEDE']);
  }

  form = this.fb.group({
    nombre:      [this.data?.nombre      ?? '', Validators.required],
    tipo:        [this.data?.tipo        ?? '' as TipoGrupo, this.isLiderCelula ? [] : Validators.required],
    descripcion: [this.data?.descripcion ?? ''],
    lugar:       [this.data?.lugar       ?? ''],
    liderSearch: [this.data?.liderNombre ?? ''],
    liderId:     [this.data?.liderId     ?? ''],
  });

  get title() { return this.isEdit ? 'Editar Grupo' : 'Nuevo Grupo'; }

  ngOnInit() {
    if (this.isLiderCelula && this.grupoPadreId) {
      this.grupoService.getMiembros(this.grupoPadreId).subscribe({
        next: miembros => this.miembrosGrupo.set(miembros),
      });
    } else {
      this.form.get('liderSearch')!.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(q => q && q.length >= 2
          ? this.memberService.buscar({ q, size: 10, estado: 'MIEMBRO' })
          : of({ content: [] } as any)
        ),
      ).subscribe(res => this.liderOpciones.set(res.content ?? []));
    }
  }

  seleccionarLider(miembro: Miembro) {
    this.form.patchValue({
      liderSearch: `${miembro.nombres} ${miembro.apellidos}`,
      liderId: miembro.id,
    });
  }

  limpiarLider() {
    this.form.patchValue({ liderSearch: '', liderId: '' });
    this.liderOpciones.set([]);
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const raw = this.form.getRawValue();
    const payload = this.isLiderCelula
      ? {
          nombre:       raw.nombre!,
          descripcion:  raw.descripcion  || undefined,
          lugar:        raw.lugar        || undefined,
          liderId:      raw.liderId      || undefined,
          grupoPadreId: this.grupoPadreId || undefined,
        }
      : {
          nombre:       raw.nombre!,
          tipo:         raw.tipo!,
          descripcion:  raw.descripcion  || undefined,
          lugar:        raw.lugar        || undefined,
          liderId:      raw.liderId      || undefined,
          grupoPadreId: this.grupoPadreId || undefined,
        };

    const op$ = this.isEdit
      ? this.grupoService.update(this.data!.id, payload)
      : this.grupoService.create(payload);

    op$.subscribe({
      next: () => { this.loading.set(false); this.dialogRef.close(true); },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'Error al guardar');
      },
    });
  }

  cancel() { this.dialogRef.close(false); }
}
