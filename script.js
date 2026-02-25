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

function showScale(scaleId) {
    currentScale = scaleId;
    document.querySelectorAll('.scale-section').forEach(sec => sec.classList.add('hidden'));
    document.querySelectorAll('.scale-btn').forEach(btn => btn.classList.remove('active'));
    const target = document.getElementById(`scale-${scaleId}`);
    if (target) target.classList.remove('hidden');
    const activeBtn = Array.from(document.querySelectorAll('.scale-btn')).find(btn => btn.getAttribute('onclick').includes(scaleId));
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
        const select = document.getElementById(container.getAttribute('data-select-id'));
        container.querySelectorAll('.option-balloon').forEach(b => b.classList.remove('selected'));
        e.target.classList.add('selected');
        select.value = e.target.getAttribute('data-value');
    }
});

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
    // Anti-duplicação
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
        if (btn.getAttribute('onclick').includes(currentScale)) {
            btn.classList.add('concluida');
            if (!btn.innerHTML.includes('✓')) btn.innerHTML += ' ✓';
        }
    });

    document.getElementById('result').style.display = 'none';
    document.getElementById('footer-relatorio').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function removerEscala(id) {
     {
        escalasSalvas = escalasSalvas.filter(e => e.id !== id);
        
 
        document.querySelectorAll('.scale-btn').forEach(btn => {
            if (btn.getAttribute('onclick').includes(id)) {
                btn.classList.remove('concluida');
                btn.innerHTML = btn.innerHTML.replace(' ✓', '');
            }
        });

        renderizarListaCompleta();
        if(escalasSalvas.length === 0) document.getElementById('footer-relatorio').style.display = 'none';
    }
}

function renderizarListaCompleta() {
    const container = document.getElementById('lista-resultados-acumulados');
    if (!container) return;
    container.innerHTML = "";


    const nome = document.getElementById('patientName').value || "__________";
    const prontuario = document.getElementById('patientRecord').value || "__________";
    const dataNasc = document.getElementById('patientBirth').value || "__________";

    const headerHTML = `
        <div class="header-print">
            <img src="logo_topo.png.png" style="height: 60px;" alt="Logo">
            <h2 style="margin:0; color:#38a700;">Relatório de Avaliações</h2>
        </div>
        <div class="patient-data-print">
            <div><strong>Paciente:</strong> ${nome}</div>
            <div><strong>Prontuário:</strong> ${prontuario}</div>
            <div><strong>DN:</strong> ${dataNasc}</div>
        </div>
    `;

    container.innerHTML = headerHTML;


    escalasSalvas.forEach(escala => {
        const escalaDiv = document.createElement('div');
        escalaDiv.className = "escala-item-impressao";
        
        escalaDiv.innerHTML = `
            <div style="background:#f0f0f0; padding:5px; font-weight:bold; display:flex; justify-content:space-between;">
                <span>${escala.titulo}</span>
                <span>Pontos: ${escala.pontuacao} - ${escala.risco}</span>
            </div>
            <div class="escala-detalhes-grid" style="padding:10px;">
                ${escala.detalhes}
            </div>
            <div class="no-print" style="text-align:right; padding:5px;">
                <button onclick="removerEscala('${escala.id}')" style="background:#dc3545; color:white; border:none; cursor:pointer; border-radius:3px;">Remover ✖</button>
            </div>
        `;
        container.appendChild(escalaDiv);
    });

 
    const sigDiv = document.createElement('div');
    sigDiv.className = "signature-area";
    sigDiv.innerHTML = `<p style="margin-top:5px;">Assinatura do Profissional Responsável</p>`;
    container.appendChild(sigDiv);
}

function printResult() {
    
    const now = new Date();
    const dataHora = `Relatório gerado em: ${now.toLocaleDateString()} às ${now.toLocaleTimeString()}`;
    
    let footer = document.getElementById('print-footer');
    if (!footer) {
        footer = document.createElement('div');
        footer.id = 'print-footer';
        footer.style.textAlign = 'center';
        footer.style.fontSize = '8pt';
        footer.style.marginTop = '20px';
        document.getElementById('lista-resultados-acumulados').appendChild(footer);
    }
    footer.innerText = dataHora;

   
function printResult() {

    if (escalasSalvas.length === 0) {
        alert("Não há escalas salvas para imprimir.");
        return;
    }


    renderizarEscalasSalvas();

   
    setTimeout(() => {
        window.print();
    }, 500);
}


function limparEscalas() {
    if (confirm("Tem certeza que deseja limpar todos os dados do paciente e o histórico de escalas?")) {
    
        escalasSalvas = [];
        
   
        document.getElementById('patientName').value = "";
        document.getElementById('patientBirth').value = "";
        document.getElementById('patientRecord').value = "";
        
     
        document.querySelectorAll('.option-balloon').forEach(b => b.classList.remove('selected'));
        document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
        
   
        document.getElementById('result').style.display = 'none';
        renderizarEscalasSalvas();
        

        document.getElementById('footer-relatorio').style.display = 'none';
        
        alert("Dados limpos com sucesso!");
    }
}

    window.print();
}