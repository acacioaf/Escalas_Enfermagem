const SCALES_INFO = {
    fugulin: { title: "Escala de Fugulin (Nível de Cuidados)", getRiskLevel: (score) => score <= 8 ? "Mínimo" : score <= 18 ? "Intermediário" : score <= 29 ? "Alta Dependência" : score <= 40 ? "Semi-Intensivo" : "Intensivo" },
    morse: { title: "Escala de Morse (Risco de Queda)", getRiskLevel: (score) => score <= 24 ? "Baixo Risco" : score <= 45 ? "Médio Risco" : "Alto Risco" },
    braden: { title: "Escala de Braden (Risco de LPP)", getRiskLevel: (score) => score >= 19 ? "Sem Risco" : score >= 15 ? "Risco Baixo" : score >= 13 ? "Risco Moderado" : score >= 10 ? "Risco Alto" : "Risco Muito Alto" },
    broncoaspiracao: { title: "Escala de Broncoaspiração", getRiskLevel: (score) => score >= 1 ? "Alto Risco" : "Baixo Risco" },
    trombose: { title: "Escala de Trombose (Caprini)", getRiskLevel: (score) => score <= 1 ? "Baixo Risco" : score === 2 ? "Risco Moderado" : score <= 4 ? "Alto Risco" : "Risco Muito Alto" },
    maddox: { title: "Escala de Maddox (Flebite)", getRiskLevel: (score) => score === 0 ? "Sem Flebite" : score <= 2 ? "Flebite Inicial" : score === 3 ? "Flebite em Evolução" : "Flebite Grave" }
};

const FIELD_LABELS = {
    mentalState: "Estado Mental", oxygenation: "Oxigenação", vitalSigns: "Sinais Vitais", mobility: "Motilidade", ambulation: "Deambulação", feeding: "Alimentação", personalCare: "Cuidado Corporal", elimination: "Eliminações", therapy: "Terapêutica", woundIntegrity: "Integridade da Pele", dressing: "Curativo", dressingTime: "Tempo de Curativo", bradenSensory: "Percepção Sensorial", bradenMoisture: "Umidade", bradenActivity: "Atividade", bradenMobility: "Mobilidade Braden", bradenNutrition: "Nutrição", bradenFriction: "Fricção", morseHistory: "Histórico de Quedas", morseSecondaryDiagnosis: "Diag. Secundário", morseAmbulatoryAid: "Auxílio Mobilidade", morseIVTherapy: "Terapia IV", morseGait: "Marcha", morseMentalState: "Estado Mental (Morse)", baVentilation: "Ventilação", baEnteralFeed: "Dieta Enteral", baMentalStatus: "Status Mental (BA)", baNauseaVomit: "Náuseas/Vômitos", baHistory: "Histórico Engasgo", baComorbidities: "Comorbidades", capriniRiskBase: "Fatores Base", capriniRiskModerate: "Moderados", capriniRiskHigh: "Altos", capriniRiskVeryHigh: "Muito Altos", maddoxGrade: "Grau Flebite"
};

let currentScale = 'fugulin';
let escalasSalvas = [];

// --- FUNÇÕES DE NAVEGAÇÃO E UI ---

function showScale(scaleId) {
    currentScale = scaleId;
    document.querySelectorAll('.scale-section').forEach(sec => sec.classList.add('hidden'));
    document.querySelectorAll('.scale-btn').forEach(btn => btn.classList.remove('active'));
    const target = document.getElementById(`scale-${scaleId}`);
    if (target) target.classList.remove('hidden');

    const activeBtn = Array.from(document.querySelectorAll('.scale-btn')).find(btn => btn.getAttribute('onclick')?.includes(scaleId));
    if (activeBtn) activeBtn.classList.add('active');
    document.getElementById('result').style.display = 'none';
}

function toggleOptions(header) {
    header.parentElement.querySelector('.option-container').classList.toggle('hidden-by-default');
    header.querySelector('.chevron').classList.toggle('expanded');
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('option-balloon')) {
        const container = e.target.parentElement;
        const selectId = container.getAttribute('data-select-id');
        const select = document.getElementById(selectId);
        if (select) {
            container.querySelectorAll('.option-balloon').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            select.value = e.target.getAttribute('data-value');
        }
    }
});

// --- LÓGICA DE CÁLCULO E SALVAMENTO ---

function generateResult() {
    const activeSection = document.getElementById(`scale-${currentScale}`);
    const selects = activeSection.querySelectorAll('select');
    let total = 0;
    selects.forEach(sel => { total += parseInt(sel.value || 0); });

    document.getElementById('totalScore').innerText = total;
    document.getElementById('careLevel').innerText = SCALES_INFO[currentScale].getRiskLevel(total);

    const container = document.getElementById('selectedOptionsContainer');
    container.innerHTML = '<h4>Detalhes Selecionados:</h4>';
    const list = document.createElement('ul');
    list.style.listStyle = 'none'; list.style.padding = '0';

    activeSection.querySelectorAll('.assessment-group').forEach(group => {
        const sel = group.querySelector('select');
        const li = document.createElement('li');
        li.innerHTML = `<strong>${FIELD_LABELS[sel.name] || sel.name}:</strong> ${sel.options[sel.selectedIndex].text}`;
        list.appendChild(li);
    });
    container.appendChild(list);

    document.getElementById('result').style.display = 'block';
    document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function salvarEscalaAtual() {
    escalasSalvas = escalasSalvas.filter(e => e.id !== currentScale);

    const novaEscala = {
        id: currentScale,
        titulo: SCALES_INFO[currentScale].title,
        pontuacao: document.getElementById('totalScore').innerText,
        risco: document.getElementById('careLevel').innerText,
        detalhes: document.getElementById('selectedOptionsContainer').innerHTML
    };

    escalasSalvas.push(novaEscala);
    renderizarListaCompleta();

    document.querySelectorAll('.scale-btn').forEach(btn => {
        if (btn.getAttribute('onclick')?.includes(currentScale)) {
            btn.classList.add('concluida');
            if (!btn.innerHTML.includes('✓')) btn.innerHTML += ' ✓';
        }
    });

    document.getElementById('result').style.display = 'none';
    document.getElementById('footer-relatorio').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function removerEscala(id) {
    escalasSalvas = escalasSalvas.filter(e => e.id !== id);
    document.querySelectorAll('.scale-btn').forEach(btn => {
        if (btn.getAttribute('onclick')?.includes(id)) {
            btn.classList.remove('concluida');
            btn.innerHTML = btn.innerHTML.replace(' ✓', '');
        }
    });
    renderizarListaCompleta();
    if (escalasSalvas.length === 0) document.getElementById('footer-relatorio').style.display = 'none';
}

// --- IMPRESSÃO E RELATÓRIO ---
function renderizarListaCompleta() {
    const container = document.getElementById('lista-resultados-acumulados');
    if (!container) return;
    container.innerHTML = "";

    const nome = document.getElementById('patientName').value || "__________";
    const prontuario = document.getElementById('patientRecord').value || "__________";

    // --- CORREÇÃO DA DATA DE NASCIMENTO ---
    const dataNascRaw = document.getElementById('patientBirth').value; // Pega o 2026-04-26
    let dataNascFormatada = "__________";

    if (dataNascRaw) {
        const partes = dataNascRaw.split('-'); // Quebra o traço
        dataNascFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`; // Remonta como 26/04/2026
    }

    // --- CORREÇÃO DA DATA DE HOJE ---
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    const dataHoje = `${dia}/${mes}/${ano}`;

    const headerHTML = `
        <div class="header-print">
            <img src="logo_topo.png.png" style="height: 60px;" alt="Logo">
            <h2 style="margin:0; color:#38a700;">Relatório de Avaliações</h2>
        </div>
        <div class="patient-data-print">
            <div><strong>Paciente:</strong> ${nome}</div>
            <div><strong>Prontuário:</strong> ${prontuario}</div>
            <div><strong>Data de Nasc:</strong> ${dataNascFormatada} <span style="margin-left:10px;">|</span> <strong>Data:</strong> ${dataHoje}</div>
        </div>
    `;

    container.innerHTML = headerHTML;
    // ... resto da função (o loop das escalas e assinatura)

    container.innerHTML = headerHTML;

    escalasSalvas.forEach(escala => {
        const escalaDiv = document.createElement('div');
        escalaDiv.className = "escala-item-impressao";
        escalaDiv.innerHTML = `
    <div style="background:#f0f0f0; padding:5px; border-bottom:1px solid #ccc;">
        <div style="font-weight:bold; font-size:10pt;">${escala.titulo}</div>
        <div style="font-size:9pt; color:#333;">Pontos: ${escala.pontuacao} - ${escala.risco}</div>
    </div>
    <div class="escala-detalhes-grid" style="padding:8px; font-size:8pt;">
        ${escala.detalhes}
    </div>
    <div class="no-print" style="text-align:right; padding:5px;">
        <button onclick="removerEscala('${escala.id}')" style="background:#dc3545; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:3px;">Remover ✖</button>
    </div>
`;
        container.appendChild(escalaDiv);
    });

    const sigDiv = document.createElement('div');
    sigDiv.className = "signature-area";
    sigDiv.style.marginTop = "30px";
    sigDiv.innerHTML = `<div style="border-top:1px solid #faf7f7; width:300px; margin:auto; text-align:center; padding-top:5px;">Assinatura do Profissional Responsável</div>`;
    container.appendChild(sigDiv);
}

function printResult() {
    if (escalasSalvas.length === 0) {
        alert("Não há escalas salvas para imprimir. Salve ao menos uma avaliação.");
        return;
    }
    renderizarListaCompleta();
    setTimeout(() => { window.print(); }, 500);
}

function limparEscalas() {
    if (!confirm("Deseja realmente apagar todos os dados do paciente e as escalas salvas?")) return;

    escalasSalvas = [];

    // Limpar inputs
    ['patientName', 'patientBirth', 'patientRecord'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

    // Resetar visuais
    document.querySelectorAll('.option-balloon').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
    document.querySelectorAll('.scale-btn').forEach(btn => {
        btn.classList.remove('concluida');
        btn.innerHTML = btn.innerHTML.replace(' ✓', '');
    });

    const resultDiv = document.getElementById('result');
    if (resultDiv) resultDiv.style.display = 'none';

    document.getElementById('footer-relatorio').style.display = 'none';
    renderizarListaCompleta();
    alert("Sistema limpo!");
}