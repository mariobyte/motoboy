export class OrdemServico {

    constructor(
        public id_os: string,
        public os_nome_cliente: string,
        public os_data: string,
        public os_hora: string,
        // public servicos: Array<Servico> = [],
        public os_status: number = 1, // 1 - Livre 2 - Executando 3 - Finalizada 4 - Cancelada
        public os_valor_frete: string,
        public os_km: string,
        public os_data_agendada: string,
        public os_hora_agendada: string,
        public os_solicitante_cliente: string,
    ) {
        // formatando a data 18112017
        this.os_data = this.os_data.substring(0, 2) + '/' + this.os_data.substring(2, 4) + '/' + this.os_data.substring(4, this.os_data.length);
        this.os_data_agendada = this.os_data_agendada.substring(0, 2) + '/' + this.os_data_agendada.substring(2, 4) + '/' + this.os_data_agendada.substring(4, this.os_data_agendada.length);
    }
}