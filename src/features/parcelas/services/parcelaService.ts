import {
  Parcela,
  ParcelaListItem,
  ParcelaDetalhe,
  CreateParcelaInput,
  UpdateParcelaInput,
} from '../types';

const PARCELAS_STORAGE_KEY = 'kulimatech_parcelas_data_v1';

// Dados iniciais realistas para o Distrito de Nhamatanda (Província de Sofala)
const INITIAL_PARCELAS: ParcelaListItem[] = [
  {
    id: 'parc-01',
    nome: 'Parcela Lamego 1 — Tomate',
    areaHectares: 2.5,
    tipoSolo: 'FRANCO',
    localizacao: 'Posto de Lamego, Talhão Sul, Junto ao Canal de Irrigação',
    latitude: -19.2345,
    longitude: 34.2189,
    agricultorId: 'usr-farm-01',
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date('2026-03-01').toISOString(),
    agricultor: {
      id: 'usr-farm-01',
      nome: 'Mateus Cossa',
      telefone: '+258 84 123 4567',
      zonaAtuacao: 'Lamego',
    },
    _count: {
      leituras: 14,
      recomendacoes: 3,
      ocorrencias: 1,
    },
  },
  {
    id: 'parc-02',
    nome: 'Parcela Lamego 2 — Milho',
    areaHectares: 1.0,
    tipoSolo: 'ARGILOSO',
    localizacao: 'Posto de Lamego, Zona Alta',
    latitude: -19.2412,
    longitude: 34.2230,
    agricultorId: 'usr-farm-01',
    createdAt: new Date('2026-02-01').toISOString(),
    updatedAt: new Date('2026-03-05').toISOString(),
    agricultor: {
      id: 'usr-farm-01',
      nome: 'Mateus Cossa',
      telefone: '+258 84 123 4567',
      zonaAtuacao: 'Lamego',
    },
    _count: {
      leituras: 8,
      recomendacoes: 2,
      ocorrencias: 1,
    },
  },
  {
    id: 'parc-03',
    nome: 'Parcela Tica 1 — Feijão Bóer',
    areaHectares: 3.2,
    tipoSolo: 'ARENOSO',
    localizacao: 'Posto Agrário de Tica, Zona Baixa',
    latitude: -19.2105,
    longitude: 34.1980,
    agricultorId: 'usr-farm-02',
    createdAt: new Date('2026-01-20').toISOString(),
    updatedAt: new Date('2026-03-02').toISOString(),
    agricultor: {
      id: 'usr-farm-02',
      nome: 'Celeste Macamo',
      telefone: '+258 82 987 6543',
      zonaAtuacao: 'Tica',
    },
    _count: {
      leituras: 21,
      recomendacoes: 5,
      ocorrencias: 0,
    },
  },
  {
    id: 'parc-04',
    nome: 'Parcela Nhamatanda-Sede — Mandioca',
    areaHectares: 1.8,
    tipoSolo: 'MISTO',
    localizacao: 'Nhamatanda-Sede, Perímetro Agrícola 3',
    latitude: -19.2678,
    longitude: 34.1750,
    agricultorId: 'usr-farm-03',
    createdAt: new Date('2026-02-10').toISOString(),
    updatedAt: new Date('2026-03-04').toISOString(),
    agricultor: {
      id: 'usr-farm-03',
      nome: 'Joaquim Sitoe',
      telefone: '+258 84 555 1212',
      zonaAtuacao: 'Nhamatanda-Sede',
    },
    _count: {
      leituras: 5,
      recomendacoes: 1,
      ocorrencias: 0,
    },
  },
];

class ParcelaService {
  private getStoredParcelas(): ParcelaListItem[] {
    if (typeof window === 'undefined') return INITIAL_PARCELAS;
    try {
      const stored = localStorage.getItem(PARCELAS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(PARCELAS_STORAGE_KEY, JSON.stringify(INITIAL_PARCELAS));
        return INITIAL_PARCELAS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_PARCELAS;
    }
  }

  private saveStoredParcelas(parcelas: ParcelaListItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PARCELAS_STORAGE_KEY, JSON.stringify(parcelas));
    } catch (err) {
      console.error('Erro ao guardar parcelas no localStorage:', err);
    }
  }

  public async getParcelas(userRole: string, userId: string): Promise<ParcelaListItem[]> {
    const list = this.getStoredParcelas();
    if (userRole === 'AGRICULTOR') {
      // Agricultor vê apenas as suas próprias parcelas
      return list.filter((p) => p.agricultorId === userId || p.agricultorId === 'usr-farm-01');
    }
    // Técnico SDAE vê parcelas dos agricultores vinculados (ou todas de demonstração)
    return list;
  }

  public async getParcelaById(id: string): Promise<ParcelaDetalhe | null> {
    const list = this.getStoredParcelas();
    const item = list.find((p) => p.id === id);
    if (!item) return null;

    const detalhe: ParcelaDetalhe = {
      ...item,
      agricultor: item.agricultor || {
        id: item.agricultorId,
        nome: 'Mateus Cossa',
        telefone: '+258 84 123 4567',
        zonaAtuacao: 'Lamego',
      },
      leiturasRecentes: [
        {
          id: 'leit-01',
          humidade: 38,
          temperatura: 28.5,
          statusHumidade: 'Humidade Adequada',
          dataLeitura: new Date().toISOString(),
        },
        {
          id: 'leit-02',
          humidade: 32,
          temperatura: 30.1,
          statusHumidade: 'Atenção Necessária',
          dataLeitura: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      recomendacoesRecentes: [
        {
          id: 'rec-01',
          parecer: 'Efetuar rega matinal de 45 minutos entre as 06:00 e 07:30.',
          status: 'Ativa',
          dataEmissao: new Date().toISOString(),
          tecnico: { id: 'usr-tech-01', nome: 'Eng. António Langa' },
          cultura: { id: 'cult-01', nome: 'Tomate' },
        },
      ],
    };
    return detalhe;
  }

  public async createParcela(input: CreateParcelaInput, agricultorId: string): Promise<ParcelaListItem> {
    const list = this.getStoredParcelas();
    const newId = `parc-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const newParcela: ParcelaListItem = {
      id: newId,
      nome: input.nome,
      areaHectares: input.areaHectares,
      tipoSolo: input.tipoSolo,
      localizacao: input.localizacao || null,
      latitude: input.latitude || null,
      longitude: input.longitude || null,
      agricultorId: agricultorId || 'usr-farm-01',
      createdAt: now,
      updatedAt: now,
      agricultor: {
        id: agricultorId || 'usr-farm-01',
        nome: 'Mateus Cossa',
        telefone: '+258 84 123 4567',
        zonaAtuacao: 'Lamego',
      },
      _count: {
        leituras: 0,
        recomendacoes: 0,
        ocorrencias: 0,
      },
    };

    const updated = [newParcela, ...list];
    this.saveStoredParcelas(updated);
    return newParcela;
  }

  public async updateParcela(id: string, input: UpdateParcelaInput): Promise<ParcelaListItem | null> {
    const list = this.getStoredParcelas();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = list[index];
    const updatedParcela: ParcelaListItem = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updatedParcela;
    this.saveStoredParcelas(list);
    return updatedParcela;
  }

  public async deleteParcela(id: string): Promise<boolean> {
    const list = this.getStoredParcelas();
    const filtered = list.filter((p) => p.id !== id);
    if (filtered.length === list.length) return false;
    this.saveStoredParcelas(filtered);
    return true;
  }
}

export const parcelaService = new ParcelaService();
