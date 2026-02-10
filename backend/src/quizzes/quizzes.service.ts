import { Injectable } from '@nestjs/common';
import { Quiz } from './quiz.entity';

@Injectable()
export class QuizzesService {
    private quizzes: Quiz[] = [
        {
            id: 'q1', // Onboarding
            passingScore: 60,
            questions: [
                { id: '1', text: 'Qual a nossa principal missão?', options: ['Lucrar', 'Inovar', 'Copiar'], correctOptionIndex: 1 },
                { id: '2', text: 'Onde fica o RH?', options: ['2º Andar', 'Térreo', 'Em casa'], correctOptionIndex: 0 },
                { id: '3', text: 'Qual o valor do VR?', options: ['R$ 10', 'R$ 30', 'R$ 50'], correctOptionIndex: 1 },
                { id: '4', text: 'Podemos usar chinelo?', options: ['Sim', 'Não', 'Sexta-feira'], correctOptionIndex: 1 },
                { id: '5', text: 'Quem é o CEO?', options: ['Bill Gates', 'Steve Jobs', 'Alice Admin'], correctOptionIndex: 2 },
            ]
        },
        {
            id: 'q2', // Segurança
            passingScore: 60,
            questions: [
                { id: '1', text: 'Qual a característica de uma senha forte?', options: ['Nome do cachorro', 'Data de nascimento', 'Letras, números e símbolos misturados'], correctOptionIndex: 2 },
                { id: '2', text: 'Com que frequência alterar senhas críticas?', options: ['Nunca', 'A cada 3-6 meses', 'Todo dia'], correctOptionIndex: 1 },
                { id: '3', text: 'O que é MFA (Autenticação de Fator Duplo)?', options: ['Uma marca', 'Camada extra de segurança', 'Um vírus'], correctOptionIndex: 1 },
                { id: '4', text: 'Você deve compartilhar sua senha?', options: ['Sim, com colegas', 'Talvez', 'Nunca, nem com T.I.'], correctOptionIndex: 2 },
                { id: '5', text: 'Onde é seguro guardar senhas?', options: ['Post-it', 'Gerenciador de Senhas', 'Bloco de notas'], correctOptionIndex: 1 },
            ]
        },
        {
            id: 'q3', // Comunicação
            passingScore: 60,
            questions: [
                { id: '1', text: 'Escuta ativa é:', options: ['Ouvir com atenção', 'Falar muito', 'Ignorar'], correctOptionIndex: 0 },
                { id: '2', text: 'Email deve ser:', options: ['Longo', 'Confuso', 'Objetivo'], correctOptionIndex: 2 },
                { id: '3', text: 'Feedback é:', options: ['Crítica', 'Presente', 'Ofensa'], correctOptionIndex: 1 },
                { id: '4', text: 'Reuniões devem ter:', options: ['Pauta', 'Pizza', 'Música'], correctOptionIndex: 0 },
                { id: '5', text: 'Comunicação não verbal:', options: ['Não existe', 'É importante', 'É mito'], correctOptionIndex: 1 },
            ]
        },
        {
            id: 'q4', // Liderança
            passingScore: 60,
            questions: [
                { id: '1', text: 'Um líder deve:', options: ['Mandar', 'Inspirar', 'Gritar'], correctOptionIndex: 1 },
                { id: '2', text: 'Delegar é:', options: ['Passar trabalho chato', 'Empoderar', 'Fugir'], correctOptionIndex: 1 },
                { id: '3', text: 'Microgerenciamento é:', options: ['Bom', 'Ruim', 'Neutro'], correctOptionIndex: 1 },
                { id: '4', text: '1:1 serve para:', options: ['Fofoca', 'Alinhamento', 'Café'], correctOptionIndex: 1 },
                { id: '5', text: 'Cultura se cria:', options: ['No papel', 'No exemplo', 'No email'], correctOptionIndex: 1 },
            ]
        },
        {
            id: 'q5', // Ágil
            passingScore: 60,
            questions: [
                { id: '1', text: 'Scrum é:', options: ['Receita', 'Framework', 'Ferramenta'], correctOptionIndex: 1 },
                { id: '2', text: 'Sprint dura:', options: ['1 ano', '2-4 semanas', '1 dia'], correctOptionIndex: 1 },
                { id: '3', text: 'Daily serve para:', options: ['Cobrar', 'Sincronizar', 'Rezar'], correctOptionIndex: 1 },
                { id: '4', text: 'PO cuida do:', options: ['Time', 'Backlog', 'Servidor'], correctOptionIndex: 1 },
                { id: '5', text: 'Kanban foca em:', options: ['Fluxo', 'Pressa', 'Caos'], correctOptionIndex: 0 },
            ]
        },
        {
            id: 'q6', // Tempo
            passingScore: 60,
            questions: [
                { id: '1', text: 'Prioridade é:', options: ['Tudo', 'O mais importante', 'Nada'], correctOptionIndex: 1 },
                { id: '2', text: 'Pomodoro é:', options: ['Tomate', 'Técnica de tempo', 'Molho'], correctOptionIndex: 1 },
                { id: '3', text: 'Multitarefa é:', options: ['Eficiente', 'Mito', 'Necessário'], correctOptionIndex: 1 },
                { id: '4', text: 'Agenda serve para:', options: ['Enfeite', 'Organizar', 'Rascunho'], correctOptionIndex: 1 },
                { id: '5', text: 'Prazos devem ser:', options: ['Ignorados', 'Cumpridos', 'Flexíveis sempre'], correctOptionIndex: 1 },
            ]
        },
        {
            id: 'q7', // Remoto
            passingScore: 60,
            questions: [
                { id: '1', text: 'Cadeira deve ser:', options: ['Macia', 'Ergonômica', 'Bonita'], correctOptionIndex: 1 },
                { id: '2', text: 'Pausas são:', options: ['Proibidas', 'Necessárias', 'Perda de tempo'], correctOptionIndex: 1 },
                { id: '3', text: 'Comunicação assíncrona:', options: ['Não exige resposta imediata', 'É ao vivo', 'É ruim'], correctOptionIndex: 0 },
                { id: '4', text: 'Câmera ligada:', options: ['Nunca', 'Ajuda na conexão', 'Trava o PC'], correctOptionIndex: 1 },
                { id: '5', text: 'Horário de trabalho:', options: ['24h', 'Deve ser respeitado', 'Não existe'], correctOptionIndex: 1 },
            ]
        },
        {
            id: 'q8', // Ética
            passingScore: 60,
            questions: [
                { id: '1', text: 'Suborno é:', options: ['Presentinho', 'Crime', 'Gentileza'], correctOptionIndex: 1 },
                { id: '2', text: 'Conflito de interesse:', options: ['Deve ser declarado', 'Escondido', 'Ignorado'], correctOptionIndex: 0 },
                { id: '3', text: 'Respeito é:', options: ['Opcional', 'Mandatório', 'Difícil'], correctOptionIndex: 1 },
                { id: '4', text: 'Assédio deve ser:', options: ['Tolerado', 'Denunciado', 'Filmado'], correctOptionIndex: 1 },
                { id: '5', text: 'Confidencialidade:', options: ['Não importa', 'É vital', 'Só para chefes'], correctOptionIndex: 1 },
            ]
        },
        {
            id: 'q9', // Inovação
            passingScore: 60,
            questions: [
                { id: '1', text: 'Design Thinking é:', options: ['Desenho', 'Abordagem de solução', 'Pensamento mágico'], correctOptionIndex: 1 },
                { id: '2', text: 'MVP significa:', options: ['Most Valuable Player', 'Minimum Viable Product', 'Muito Valor Agregado'], correctOptionIndex: 1 },
                { id: '3', text: 'Brainstorming serve para:', options: ['Causar confusão', 'Gerar ideias', 'Criticar'], correctOptionIndex: 1 },
                { id: '4', text: 'Inovação aberta é:', options: ['Portas abertas', 'Colaboração externa', 'Sem segredos'], correctOptionIndex: 1 },
                { id: '5', text: 'Pivotar significa:', options: ['Girar', 'Mudar estratégia', 'Desistir'], correctOptionIndex: 1 },
            ]
        },
        {
            id: 'q10', // Diversidade
            passingScore: 60,
            questions: [
                { id: '1', text: 'Diversidade traz:', options: ['Conflito', 'Inovação e resultados', 'Nada'], correctOptionIndex: 1 },
                { id: '2', text: 'Equidade é:', options: ['Igualdade', 'Justiça conforme necessidade', 'Favoritismo'], correctOptionIndex: 1 },
                { id: '3', text: 'Viés inconsciente:', options: ['Não existe', 'Afeta decisões', 'É consciente'], correctOptionIndex: 1 },
                { id: '4', text: 'Inclusão é:', options: ['Convidar para o baile', 'Tirar para dançar', 'Ambos'], correctOptionIndex: 1 },
                { id: '5', text: 'Aliado é:', options: ['Inimigo', 'Apoia a causa', 'Indiferente'], correctOptionIndex: 1 },
            ]
        },
        {
            id: 'q11', // Gestão de Projetos
            passingScore: 60,
            questions: [
                { id: '1', text: 'Stakeholder é:', options: ['Dono do bife', 'Parte interessada', 'Gerente'], correctOptionIndex: 1 },
                { id: '2', text: 'Escopo define:', options: ['O que será feito', 'O custo', 'O tempo'], correctOptionIndex: 0 },
                { id: '3', text: 'Risco deve ser:', options: ['Ignorado', 'Mitigado', 'Aceito sempre'], correctOptionIndex: 1 },
                { id: '4', text: 'Cronograma controla:', options: ['Custo', 'Qualidade', 'Tempo'], correctOptionIndex: 2 },
                { id: '5', text: 'KPI mede:', options: ['Desempenho', 'Distância', 'Peso'], correctOptionIndex: 0 },
            ]
        },
        {
            id: 'q12', // Mindfulness
            passingScore: 60,
            questions: [
                { id: '1', text: 'Mindfulness foca no:', options: ['Futuro', 'Presente', 'Passado'], correctOptionIndex: 1 },
                { id: '2', text: 'Benefício da prática:', options: ['Mais estresse', 'Foco e calma', 'Sono'], correctOptionIndex: 1 },
                { id: '3', text: 'Pode ser praticado:', options: ['Só sentado', 'Em qualquer lugar', 'Só no templo'], correctOptionIndex: 1 },
                { id: '4', text: 'Ajuda na:', options: ['Regulação emocional', 'Fome', 'Sede'], correctOptionIndex: 0 },
                { id: '5', text: 'Tempo ideal:', options: ['1 hora', 'Qualquer tempo', '10 segundos'], correctOptionIndex: 1 },
            ]
        },
        {
            id: 'q13', // Customer Success
            passingScore: 60,
            questions: [
                { id: '1', text: 'Foco do CS:', options: ['Vender', 'Sucesso do cliente', 'Cobrar'], correctOptionIndex: 1 },
                { id: '2', text: 'Churn é:', options: ['Cancelamento', 'Novo cliente', 'Lucro'], correctOptionIndex: 0 },
                { id: '3', text: 'Onboarding de cliente:', options: ['Demissão', 'Treinamento inicial', 'Festa'], correctOptionIndex: 1 },
                { id: '4', text: 'NPS mede:', options: ['Lucro', 'Lealdade', 'Tempo'], correctOptionIndex: 1 },
                { id: '5', text: 'Upsell é:', options: ['Vender mais', 'Vender menos', 'Doar'], correctOptionIndex: 0 },
            ]
        },
        {
            id: 'q14', // LGPD
            passingScore: 60,
            questions: [
                { id: '1', text: 'LGPD protege:', options: ['Empresas', 'Dados pessoais', 'Animais'], correctOptionIndex: 1 },
                { id: '2', text: 'Dado sensível:', options: ['Nome', 'Religião/Saúde', 'Email'], correctOptionIndex: 1 },
                { id: '3', text: 'DPO é:', options: ['Diretor', 'Encarregado de dados', 'Polícia'], correctOptionIndex: 1 },
                { id: '4', text: 'Consentimento deve ser:', options: ['Falso', 'Explícito', 'Implícito'], correctOptionIndex: 1 },
                { id: '5', text: 'Multa pode ser:', options: ['Barata', 'Milionária', 'Inexistente'], correctOptionIndex: 1 },
            ]
        },
        {
            id: 'q15', // Marketing Digital
            passingScore: 60,
            questions: [
                { id: '1', text: 'SEO otimiza para:', options: ['Jornal', 'Buscadores', 'Rádio'], correctOptionIndex: 1 },
                { id: '2', text: 'Inbound Marketing:', options: ['Atrai clientes', 'Interrompe', 'É spam'], correctOptionIndex: 0 },
                { id: '3', text: 'Lead é:', options: ['Cliente', 'Potencial cliente', 'Fornecedor'], correctOptionIndex: 1 },
                { id: '4', text: 'CTA significa:', options: ['Call to Action', 'Call The Agent', 'Cat To Act'], correctOptionIndex: 0 },
                { id: '5', text: 'ROI mede:', options: ['Retorno sobre Investimento', 'Risco', 'Rede'], correctOptionIndex: 0 },
            ]
        },
        {
            id: 'q16', // IA
            passingScore: 60,
            questions: [
                { id: '1', text: 'IA Generativa cria:', options: ['Conteúdo novo', 'Nada', 'Cópias'], correctOptionIndex: 0 },
                { id: '2', text: 'ChatGPT é:', options: ['Buscador', 'Modelo de linguagem', 'Humano'], correctOptionIndex: 1 },
                { id: '3', text: 'Prompt é:', options: ['Comando', 'Resposta', 'Erro'], correctOptionIndex: 0 },
                { id: '4', text: 'Machine Learning:', options: ['Aprende com dados', 'É mágica', 'É hardware'], correctOptionIndex: 0 },
                { id: '5', text: 'Risco da IA:', options: ['Dominação', 'Alucinação/Viés', 'Nenhum'], correctOptionIndex: 1 },
            ]
        }
    ];

    findAll(): Quiz[] {
        return this.quizzes;
    }

    findOne(id: string): Quiz | undefined {
        return this.quizzes.find((q) => q.id === id);
    }

    createQuiz(data: any): Quiz {
        const newQuiz: Quiz = {
            id: `q${this.quizzes.length + 100}`, // Ensure unique ID avoiding clash with seeds
            passingScore: 60, // Default
            questions: data.questions.map((q: any, index: number) => ({
                id: `${index + 1}`,
                text: q.text,
                options: q.options,
                correctOptionIndex: parseInt(q.correctOptionIndex)
            }))
        };
        this.quizzes.push(newQuiz);
        return newQuiz;
    }
}
