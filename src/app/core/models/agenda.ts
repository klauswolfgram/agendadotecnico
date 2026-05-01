export class Agenda {
    
    status: string = '';
    message: string = '';
    data: Array<Agendamento> = [];
}

export class Agendamento {
    filial: string = '';
    id: string = '';
    os: string = '';
    cliente: string = '';
    dadoscliente: Cliente = new Cliente();
    equipamento: string = '';
    abertura: string = '';
    data: string = '';
    encerramento: string = '';
    ocorrencia: string = '';
    situacao: string = '';
    status: string = '';
    statusType: string = '';
    statusIcon: string = '';
    texto_ocorrencia: string = '';
}

export class Cliente {
    codigo: string = '';
    cgc: string = '';
    cep: string = '';
    nome: string = '';
    endereco: string = '';
    bairro: string = '';
    cidade: string = '';
    estado: string = '';
    telefone: string = '';
    email: string = '';
}