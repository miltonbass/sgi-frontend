import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ContactoService } from '../../../core/services/contacto.service';
import { ContactoResponse, ContactoTipo, ResumenSeguimiento } from '../../../core/models/contacto.model';

export interface ContactoHistorialDialogData {
  miembroId: string;
  miembroNombres: string;
  miembroApellidos: string;
}

@Component({
  selector: 'app-contacto-historial-dialog',
  standalone: true,
  imports: [
    DatePipe, MatDialogModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatPaginatorModule, MatDividerModule, MatChipsModule,
  ],
  templateUrl: './contacto-historial-dialog.component.html',
  styleUrl: './contacto-historial-dialog.component.scss',
})
export class ContactoHistorialDialogComponent implements OnInit {
  readonly data: ContactoHistorialDialogData = inject(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<ContactoHistorialDialogComponent>);
  private readonly service = inject(ContactoService);

  readonly loadingResumen  = signal(true);
  readonly loadingContactos = signal(true);
  readonly resumen    = signal<ResumenSeguimiento | null>(null);
  readonly contactos  = signal<ContactoResponse[]>([]);
  readonly total      = signal(0);
  readonly pageIndex  = signal(0);
  readonly pageSize   = signal(10);

  readonly tipoLabels: Record<ContactoTipo, string> = {
    LLAMADA: 'Llamada', VISITA: 'Visita', MENSAJE: 'Mensaje', REUNION: 'Reunión',
  };
  readonly tipoIcons: Record<ContactoTipo, string> = {
    LLAMADA: 'phone', VISITA: 'home', MENSAJE: 'chat', REUNION: 'groups',
  };

  ngOnInit() {
    this.cargarResumen();
    this.cargarContactos();
  }

  cargarResumen() {
    this.loadingResumen.set(true);
    this.service.resumen(this.data.miembroId).subscribe({
      next: r  => { this.resumen.set(r); this.loadingResumen.set(false); },
      error: () => this.loadingResumen.set(false),
    });
  }

  cargarContactos() {
    this.loadingContactos.set(true);
    this.service.listar(this.data.miembroId, this.pageIndex(), this.pageSize()).subscribe({
      next: p  => { this.contactos.set(p.content); this.total.set(p.totalElements); this.loadingContactos.set(false); },
      error: () => this.loadingContactos.set(false),
    });
  }

  onPage(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.cargarContactos();
  }
}
