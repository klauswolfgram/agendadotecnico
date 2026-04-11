import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PoButtonModule, PoFieldModule, PoInfoModule } from '@po-ui/ng-components';
import { AuthService } from '../../core/services/auth-service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,PoFieldModule,PoButtonModule,PoInfoModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})

export class Login implements OnDestroy {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private sub = new Subscription();
  private router = inject(Router);

  public form = this.fb.group({
    username: ['',[Validators.required,Validators.minLength(3)]],
    password: ['',[Validators.required]]
  });

  constructor() {

  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public submit = () => {
    
    const username: string = this.form.value.username ?? '';
    const password: string = this.form.value.password ?? '';

    this.sub.add(this.authService.createSection(username,password).subscribe({next: () => this.router.navigate([''])}));
  }

}
