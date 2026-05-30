import { Routes } from '@angular/router';
import { loginGuard } from './core/guards/login-guard';
import { Master } from './pages/master/master';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {path: 'login', canActivate: [loginGuard], loadComponent: () => import('./pages/login/login').then(v => v.Login)},
    {path: '', canActivate: [authGuard], component: Master, children: [
        {path: '', loadComponent: () => import('./pages/master/agendamentos/agendamentos').then(v => v.Agendamentos)},
        {path: 'agendamento/:id', loadComponent: () => import('./pages/master/agendamentos/agendamento/agendamento').then(v => v.Agendamento)},
        {path: 'agendamento/:id/galeria', loadComponent: () => import('./pages/master/agendamentos/agendamento/galeria/galeria').then(v => v.Galeria)},
        {path: 'agendamento/:id/atendimentos', loadComponent: () => import('./pages/master/agendamentos/agendamento/atendimentos/atendimentos').then(v => v.Atendimentos)},
        {path: 'agendamento/:id/atendimentos/novo', loadComponent: () => import('./pages/master/agendamentos/agendamento/atendimentos/novo/novo').then(v => v.Novo)},
        {path: 'notificacoes', loadComponent: () => import('./pages/master/notificacoes/notificacoes').then(v => v.Notificacoes)},
        {path: 'assinatura/:origem/:id_os', loadComponent: () => import('./pages/master/assinatura/assinatura').then(v => v.Assinatura)},
        {path: 'assinatura/:origem/:id_os/:id_atendimento', loadComponent: () => import('./pages/master/assinatura/assinatura').then(v => v.Assinatura)},
    ]},
    {path: 'error', loadComponent: () => import('./pages/error/error').then(v => v.Error)},
    {path: '**', redirectTo: 'error'}
];
