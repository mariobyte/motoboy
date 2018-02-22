export class Servico {

    constructor(
        public id_os: string,
        public id_item: string,
        public item_endereco_origem: string,
        public item_servico_origem: string,
        public item_endereco_destino: string,
        public item_servico_destino: string,
        public item_assinatura: string,
        public status: number, // 1 - Livre 2 - Executando 3 - Finalizada 4 - Cancelada        


        public latitude: number = 0,
        public longitude: number = 0,
        public timestampCheckin: number = 0,
        public timestampCheckout: number = 0,
        public assinatura: string = '',
        public avisado: boolean = false
    ) {
    }
}