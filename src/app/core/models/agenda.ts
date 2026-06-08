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
    atendimentos: Atendimento[] = [];
    id_assinatura: string = '';
}

export class Atendimento {
    id: string = '';
    id_os: string = '';
    os: string = '';
    tecnico: string = '';
    sequencia: string = '';
    ocorrencia: string = '';
    chegada: string = '';
    inicio: string = '';
    fim: string = '';
    traslado: string = '';
    situacao: string = '';
    texto: string = '';
    coordenadas: string = '';
    endereco: string = '';
    id_assinatura: string = '';
    sync: boolean = false;
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