export class Section {
    access_token: string = ''
    expires_in: number = 0
    refresh_token: string = ''
    token_type: string = ''
    expires_token: number = 0
    expires_refresh_token: number = 0
    username: string = ''
    userid: string = ''
    tecnico: Tecnico = new Tecnico
}

export class Tecnico {
    codtec: string = ''
    nome: string = ''
    funcao: string = ''
    desc_funcao: string = ''
    equipe: string = ''
    desc_equipe: string = ''
}

export class RespTecnico {
    status: string = ''
    message: string = ''
    data: Tecnico = new Tecnico
}