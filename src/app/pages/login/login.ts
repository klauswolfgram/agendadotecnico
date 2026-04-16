import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PoButtonModule, PoFieldModule, PoInfoModule, PoNotificationService } from '@po-ui/ng-components';
import { AuthService } from '../../core/services/auth-service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Toolbar } from '../../shared/toolbar/toolbar';
import { Footer } from '../../shared/footer/footer';
import { ToolbarService } from '../../core/services/toolbar-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,PoFieldModule,PoButtonModule,PoInfoModule,Toolbar,Footer],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})

export class Login implements OnDestroy {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notify = inject(PoNotificationService);
  private sub = new Subscription();
  private router = inject(Router);
  private toolbarService = inject(ToolbarService);

  public form = this.fb.group({
    username: ['',[Validators.required,Validators.minLength(3)]],
    password: ['',[Validators.required]]
  });

  constructor() {
    this.toolbarService.isLoggedOn.set(false);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public submit = () => {
    
    const username: string = this.form.value.username ?? '';
    const password: string = this.form.value.password ?? '';

    this.sub.add(this.authService.createSection(username,password).subscribe({
      next: () => {
        this.notify.success({duration: 1500, message: 'Login bem sucedido!'})
        this.router.navigate(['']);
      },
      error: (e) => this.notify.error(e.error.message),
    }));
  }

}
