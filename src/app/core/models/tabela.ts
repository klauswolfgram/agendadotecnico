export class Tabela {
    status: string = '';
    recurso: string = '';
    message: string = '';
    data: Array<Linha> = [];
}

export class Linha {
    id: string = '';
    filial: string = '';
    codigo: string = '';
    descri: string = '';
}