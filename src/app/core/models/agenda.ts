export class Agenda {
    status: string = '';
    message: string = '';
    data: Agendamento[] = [];
}

export class Agendamento {
    filial: string = '';
    id: string = '';
    os: string = '';
    cliente: string = '';
    dadoscliente: Cliente = new Cliente();
    equipamento: string = '';
    data: string = '';
    ocorrencia: string = '';
    situacao: string = '';
    status: string = '';
    statusType: string = '';
    texto_ocorrencia: string = '';
}

export class Cliente {
    codigo: string = '';
    cgc: string = '';
    nome: string = '';
    cep: string = '';
    endereco: string = '';
    bairro: string = '';
    cidade: string = '';
    estado: string = '';
    telefone: string = '';
    email: string = '';
}