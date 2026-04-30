import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MemberService } from '../../../core/services/member.service';
import { ImportResult } from '../../../core/models/member.model';

@Component({
  selector: 'app-member-import-dialog',
  standalone: true,
  imports: [
    FormsModule, MatDialogModule, MatButtonModule,
    MatSelectModule, MatFormFieldModule,
    MatProgressSpinnerModule, MatIconModule, MatDividerModule,
  ],
  templateUrl: './member-import-dialog.component.html',
  styleUrl: './member-import-dialog.component.scss',
})
export class MemberImportDialogComponent {
  private readonly memberService = inject(MemberService);
  private readonly dialogRef     = inject(MatDialogRef<MemberImportDialogComponent>);

  readonly loading  = signal(false);
  readonly error    = signal('');
  readonly result   = signal<ImportResult | null>(null);

  archivo: File | null = null;
  estadoDefault: 'VISITOR' | 'MIEMBRO' = 'VISITOR';

  get archivoNombre() { return this.archivo?.name ?? ''; }
  get hasResult()     { return this.result() !== null; }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.archivo = input.files?.[0] ?? null;
    this.error.set('');
  }

  submit() {
    if (!this.archivo) {
      this.error.set('Selecciona un archivo CSV o Excel');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.memberService.importar(this.archivo, this.estadoDefault).subscribe({
      next: res => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'Error al procesar el archivo');
      },
    });
  }

  close() { this.dialogRef.close(this.hasResult); }
}
