export class Notificacao {
    id: string = '';
    title: string = '';
    message: string = '';
    link: string = '';
    date_notify: string = '';
    read: boolean = false;
}

export class RetNotificacoes {
    status: string = '';
    message: string = '';
    notificacoes:  Notificacao[] = [];
}

export interface RetAcaoNotificacao {
    status: string;
    message: string;
}