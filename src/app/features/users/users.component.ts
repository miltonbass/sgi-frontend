import { Component, inject, signal, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../core/services/user.service';
import { Usuario } from '../../core/models/user.model';
import { UserFormComponent } from './user-form/user-form.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatToolbarModule, MatChipsModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly usuarios = signal<Usuario[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);

  readonly displayedColumns = ['nombre', 'email', 'username', 'roles', 'estado', 'acciones'];

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.userService.getAll({ pagina: this.pageIndex(), tamano: this.pageSize() }).subscribe({
      next: res => {
        this.usuarios.set(res.usuarios);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onPage(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.load();
  }

  openCreate() {
    this.dialog
      .open(UserFormComponent, { width: '560px', disableClose: true })
      .afterClosed()
      .subscribe(ok => ok && this.load());
  }

  openEdit(user: Usuario) {
    this.dialog
      .open(UserFormComponent, { width: '560px', disableClose: true, data: user })
      .afterClosed()
      .subscribe(ok => ok && this.load());
  }

  getRoles(user: Usuario): string[] {
    return [...new Set(user.sedes.flatMap(s => s.roles))];
  }
}
