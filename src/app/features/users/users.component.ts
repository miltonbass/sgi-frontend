import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../core/services/user.service';
import { Usuario, ROLES_DISPONIBLES } from '../../core/models/user.model';
import { UserFormComponent } from './user-form/user-form.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly dialog      = inject(MatDialog);
  private readonly snackBar    = inject(MatSnackBar);
  private readonly destroy$    = new Subject<void>();

  readonly loading   = signal(false);
  readonly usuarios  = signal<Usuario[]>([]);
  readonly total     = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize  = signal(20);

  readonly rolCtrl = new FormControl<string>('');
  readonly roles   = ['', ...ROLES_DISPONIBLES] as const;

  readonly displayedColumns = ['nombre', 'email', 'username', 'roles', 'estado', 'acciones'];

  ngOnInit() {
    this.load();
    this.rolCtrl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => { this.pageIndex.set(0); this.load(); });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  load() {
    this.loading.set(true);
    const rol = this.rolCtrl.value || undefined;
    this.userService.getAll({ rol, pagina: this.pageIndex(), tamano: this.pageSize() }).subscribe({
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
      .open(UserFormComponent, { width: '580px', disableClose: true })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  openEdit(user: Usuario) {
    this.dialog
      .open(UserFormComponent, { width: '580px', disableClose: true, data: user })
      .afterClosed().subscribe(ok => ok && this.load());
  }

  getRoles(user: Usuario): string[] {
    return [...new Set(user.sedes.flatMap(s => s.roles))];
  }
}
