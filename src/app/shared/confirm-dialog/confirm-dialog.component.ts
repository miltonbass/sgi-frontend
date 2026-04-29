import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  inputLabel?: string;
  inputRequired?: boolean;
}

export interface ConfirmDialogResult {
  confirmed: boolean;
  inputValue?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      @if (data.inputLabel) {
        <mat-form-field appearance="outline" class="full-width" style="margin-top:8px">
          <mat-label>{{ data.inputLabel }}</mat-label>
          <textarea matInput [formControl]="inputCtrl" rows="3"></textarea>
        </mat-form-field>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close(false)">Cancelar</button>
      <button
        mat-raised-button
        color="warn"
        [disabled]="data.inputRequired && !inputCtrl.value"
        (click)="close(true)"
      >
        {{ data.confirmLabel ?? 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly inputCtrl = new FormControl('');

  close(confirmed: boolean) {
    this.ref.close({ confirmed, inputValue: this.inputCtrl.value ?? '' } satisfies ConfirmDialogResult);
  }
}
