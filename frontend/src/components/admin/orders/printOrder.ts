import { ServiceOrder } from '../../../types/serviceOrder';

export function getStatusLabel(status: ServiceOrder['status']): string {
  switch (status) {
    case 'DRAFT':
      return 'Rascunho';
    case 'IN_PROGRESS':
      return 'Em Execução na Oficina';
    case 'WAITING_PARTS':
      return 'Aguardando Peças';
    case 'COMPLETED':
      return 'Concluído & Aferido';
    case 'DELIVERED':
      return 'Entregue ao Cliente';
    case 'CANCELLED':
      return 'Cancelado';
    default:
      return status;
  }
}

export function printIsolatedOrder(order: ServiceOrder, options?: { hideFinancials?: boolean }) {
  const hideFinancials = Boolean(options?.hideFinancials);

  const oldIframe = document.getElementById('isolated-print-iframe');
  if (oldIframe) {
    oldIframe.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'isolated-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  const hpGain =
    order.dynoTelemetry?.afterHp && order.dynoTelemetry?.beforeHp
      ? order.dynoTelemetry.afterHp - order.dynoTelemetry.beforeHp
      : null;

  const torqueGain =
    order.dynoTelemetry?.afterTorque && order.dynoTelemetry?.beforeTorque
      ? (order.dynoTelemetry.afterTorque - order.dynoTelemetry.beforeTorque).toFixed(1)
      : null;

  const checklist = order.checklist;
  const evidences = order.evidences || [];
  const timeline = order.timeline || [];

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Dossiê de Manutenção - ${order.osNumber} - ${order.client.name}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #18181b;
      background: #ffffff;
      padding: 8px 12px;
      font-size: 11px;
      line-height: 1.38;
    }
    .header {
      border-bottom: 3px solid #dc2626;
      padding-bottom: 10px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      font-style: italic;
      letter-spacing: -1px;
      text-transform: uppercase;
      color: #000000;
    }
    .brand-title span {
      color: #dc2626;
      font-weight: normal;
    }
    .brand-sub {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #3f3f46;
      margin-top: 2px;
    }
    .brand-info {
      font-size: 9px;
      color: #71717a;
      margin-top: 2px;
    }
    .os-badge-box {
      background: #f4f4f5;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      padding: 7px 11px;
      text-align: right;
    }
    .os-badge-label {
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #71717a;
      font-family: monospace;
    }
    .os-number {
      font-size: 18px;
      font-weight: 900;
      color: #dc2626;
      font-family: monospace;
      letter-spacing: -0.5px;
    }
    .os-status {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      background: #e4e4e7;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 2px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }
    .card {
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      padding: 8px 10px;
    }
    .card-title {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #dc2626;
      border-bottom: 1px solid #e4e4e7;
      padding-bottom: 3px;
      margin-bottom: 5px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2.5px;
      font-size: 10px;
    }
    .row-label {
      color: #71717a;
    }
    .row-val {
      font-weight: 600;
      color: #18181b;
      text-align: right;
    }
    .section-title {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      color: #18181b;
      margin-bottom: 5px;
      border-left: 3px solid #dc2626;
      padding-left: 6px;
    }
    .dyno-box {
      background: #090a0d;
      color: #ffffff;
      border-radius: 8px;
      padding: 9px 11px;
      margin-bottom: 12px;
    }
    .dyno-title {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #27272a;
      padding-bottom: 4px;
      margin-bottom: 7px;
      color: #ffffff;
      display: flex;
      justify-content: space-between;
    }
    .dyno-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      text-align: center;
    }
    .dyno-stat {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 6px;
      padding: 5px;
    }
    .dyno-stat.highlight {
      background: #450a0a;
      border-color: #dc2626;
    }
    .dyno-stat-label {
      font-size: 8px;
      text-transform: uppercase;
      font-weight: 700;
      color: #a1a1aa;
      display: block;
    }
    .dyno-stat-val {
      font-size: 14px;
      font-weight: 900;
      font-family: monospace;
      color: #f4f4f5;
    }
    .dyno-stat.highlight .dyno-stat-val {
      color: #ef4444;
    }
    .dyno-gain {
      font-size: 8px;
      font-weight: 700;
      color: #10b981;
      font-family: monospace;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 10px;
    }
    th {
      background: #f4f4f5;
      color: #3f3f46;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8.5px;
      padding: 5px 7px;
      border-top: 1px solid #d4d4d8;
      border-bottom: 1px solid #d4d4d8;
      text-align: left;
    }
    td {
      padding: 5px 7px;
      border-bottom: 1px solid #e4e4e7;
    }
    tr:nth-child(even) {
      background: #fafafa;
    }
    .badge {
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 1.5px 5px;
      border-radius: 3px;
      display: inline-block;
      font-family: monospace;
    }
    .badge-service {
      background: #fee2e2;
      color: #b91c1c;
    }
    .badge-part {
      background: #f4f4f5;
      color: #3f3f46;
    }
    .badge-ok {
      background: #dcfce7;
      color: #15803d;
    }
    .evidence-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .evidence-card {
      border: 1px solid #e4e4e7;
      border-radius: 6px;
      overflow: hidden;
      background: #fafafa;
      break-inside: avoid;
    }
    .evidence-card img {
      width: 100%;
      height: 95px;
      object-fit: cover;
      display: block;
    }
    .evidence-body {
      padding: 5px 7px;
      font-size: 9px;
    }
    .financial-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }
    .total-box {
      background: #f4f4f5;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      padding: 8px 10px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
      font-size: 10px;
    }
    .total-final {
      border-top: 2px solid #d4d4d8;
      padding-top: 5px;
      margin-top: 4px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .total-final-val {
      font-size: 16px;
      font-weight: 900;
      color: #dc2626;
      font-family: monospace;
    }
    .terms {
      border: 1px solid #e4e4e7;
      border-radius: 6px;
      padding: 7px 9px;
      font-size: 8.5px;
      color: #52525b;
      margin-bottom: 16px;
      background: #fafafa;
      line-height: 1.35;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      text-align: center;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e4e4e7;
      break-inside: avoid;
    }
    .sig-line {
      border-bottom: 1px solid #18181b;
      width: 80%;
      margin: 0 auto 4px auto;
    }
    .sig-name {
      font-size: 10px;
      font-weight: 700;
      color: #18181b;
    }
    .sig-role {
      font-size: 8.5px;
      color: #71717a;
    }
    .footer-doc {
      text-align: center;
      font-size: 8px;
      font-family: monospace;
      color: #a1a1aa;
      margin-top: 10px;
      border-top: 1px solid #f4f4f5;
      padding-top: 4px;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand-title">63<span>MOTORSPORT</span></div>
      <div class="brand-sub">High Performance Lab, Workshop & Dyno Center</div>
      <div class="brand-info">CNPJ: 42.163.063/0001-99 • Joinville / SC • Tel/WhatsApp: (47) 99882-1455</div>
      <div class="brand-info">Operador/Responsável: <strong>${order.leadOperator || 'Equipe 63 Motorsport'}</strong> • Box: ${order.boxRamp || 'Oficina Central'}</div>
    </div>

    <div class="os-badge-box">
      <div class="os-badge-label">${hideFinancials ? 'LAUDO TÉCNICO OPERACIONAL' : 'ORDEM DE SERVIÇO & DOSSIÊ'}</div>
      <div class="os-number">${order.osNumber}</div>
      <div class="os-status">${getStatusLabel(order.status)}</div>
      <div style="font-size: 8.5px; color: #52525b; font-family: monospace; margin-top: 3px;">
        Início: ${new Date(order.maintenanceStartedAt || order.createdAt).toLocaleString('pt-BR')}
      </div>
      ${
        order.maintenanceCompletedAt
          ? `<div style="font-size: 8.5px; color: #15803d; font-family: monospace; font-weight: 700;">
              Fim: ${new Date(order.maintenanceCompletedAt).toLocaleString('pt-BR')}
            </div>`
          : ''
      }
    </div>
  </div>

  <!-- Cards Cliente & Veículo -->
  <div class="grid-2">
    <div class="card">
      <div class="card-title">Dados do Proprietário / Cliente</div>
      <div class="row"><span class="row-label">Nome:</span><span class="row-val">${order.client.name}</span></div>
      ${order.client.document ? `<div class="row"><span class="row-label">CPF/CNPJ:</span><span class="row-val">${order.client.document}</span></div>` : ''}
      <div class="row"><span class="row-label">Telefone:</span><span class="row-val">${order.client.phone}</span></div>
      ${order.client.city ? `<div class="row"><span class="row-label">Cidade:</span><span class="row-val">${order.client.city}</span></div>` : ''}
    </div>

    <div class="card">
      <div class="card-title">Identificação do Veículo & Check-in</div>
      <div class="row"><span class="row-label">Veículo:</span><span class="row-val">${order.vehicle.model}</span></div>
      <div class="row"><span class="row-label">Placa / Ano:</span><span class="row-val">${order.vehicle.plate || 'Não informada'} • ${order.vehicle.year || '-'}</span></div>
      <div class="row"><span class="row-label">Km Entrada → Saída:</span><span class="row-val">${checklist?.mileageEntry || order.vehicle.mileage || '-'} → ${checklist?.mileageExit || 'Em aferição'}</span></div>
      <div class="row"><span class="row-label">Combustível / Tanque:</span><span class="row-val">${order.vehicle.fuel || 'Gasolina Podium'} (${checklist?.fuelLevelEntry || '1/2'})</span></div>
    </div>
  </div>

  <!-- Telemetria de Dinamômetro (Se houver) -->
  ${
    order.dynoTelemetry && (order.dynoTelemetry.afterHp || order.dynoTelemetry.beforeHp)
      ? `
  <div class="dyno-box">
    <div class="dyno-title">
      <span>Telemetria de Potência & Dinamômetro Servitec 4x4</span>
      <span style="font-family: monospace; font-size: 9px; color: #a1a1aa;">Aferição em Roda (WHP)</span>
    </div>
    <div class="dyno-grid">
      <div class="dyno-stat">
        <span class="dyno-stat-label">Potência Original</span>
        <span class="dyno-stat-val">${order.dynoTelemetry.beforeHp || '-'} WHP</span>
      </div>
      <div class="dyno-stat highlight">
        <span class="dyno-stat-label" style="color: #fca5a5;">Potência Calibrada</span>
        <span class="dyno-stat-val">${order.dynoTelemetry.afterHp || '-'} WHP</span>
        ${
          hpGain && hpGain > 0
            ? `<span class="dyno-gain">+${hpGain} WHP (+${Math.round(
                (hpGain / (order.dynoTelemetry.beforeHp || 1)) * 100
              )}%)</span>`
            : ''
        }
      </div>
      <div class="dyno-stat">
        <span class="dyno-stat-label">Torque Final</span>
        <span class="dyno-stat-val">${order.dynoTelemetry.afterTorque || '-'} kgfm</span>
        ${torqueGain && Number(torqueGain) > 0 ? `<span class="dyno-gain">+${torqueGain} kgfm</span>` : ''}
      </div>
      <div class="dyno-stat">
        <span class="dyno-stat-label">Pressão Turbo</span>
        <span class="dyno-stat-val">${
          order.dynoTelemetry.boostPressure ? order.dynoTelemetry.boostPressure + ' bar' : 'Aspirado'
        }</span>
      </div>
    </div>
  </div>
  `
      : ''
  }

  <!-- Checklist de Vistoria de Entrada & Saída -->
  ${
    checklist && checklist.items && checklist.items.length > 0
      ? `
  <div class="section-title">Checklist Técnico do Veículo (Entrada vs. Saída)</div>
  <div style="font-size: 9px; color: #52525b; margin-bottom: 5px;">
    <strong>Scanner OBD Entrada:</strong> ${checklist.obdFaultCodesEntry || '0 falhas'} •
    <strong>Scanner OBD Saída:</strong> ${checklist.obdFaultCodesExit || '0 falhas'} •
    <strong>Vistoria Física:</strong> ${checklist.bodyworkNotes || 'Sem avarias'}
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 32px;">#</th>
        <th>Item de Inspeção de Segurança & Performance</th>
        <th style="width: 75px; text-align: center;">Entrada</th>
        <th style="width: 75px; text-align: center;">Saída</th>
        <th>Observação Técnica</th>
      </tr>
    </thead>
    <tbody>
      ${checklist.items
        .map(
          (chk, i) => `
        <tr>
          <td style="font-family: monospace; color: #71717a;">#${String(i + 1).padStart(2, '0')}</td>
          <td><strong>${chk.label}</strong></td>
          <td style="text-align: center;"><span class="badge badge-ok">${chk.entryStatus}</span></td>
          <td style="text-align: center;"><span class="badge badge-ok">${chk.exitStatus}</span></td>
          <td style="color: #52525b;">${chk.notes || '-'}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
  `
      : ''
  }

  <!-- Tabela de Serviços e Peças (Coisas Feitas no Carro) -->
  <div class="section-title">Coisas Feitas no Carro (Serviços Executados & Peças Aplicadas)</div>
  <table>
    <thead>
      <tr>
        <th style="width: 35px;">#</th>
        <th style="width: 70px;">Tipo</th>
        <th>Descrição Técnica do Serviço ou Peça</th>
        <th style="width: 45px; text-align: center;">Qtd</th>
        ${
          !hideFinancials
            ? `<th style="width: 85px; text-align: right;">Unitário</th>
               <th style="width: 85px; text-align: right;">Total</th>`
            : `<th style="width: 90px; text-align: center;">Status</th>`
        }
      </tr>
    </thead>
    <tbody>
      ${order.items
        .map(
          (item, idx) => `
        <tr>
          <td style="font-family: monospace; color: #71717a;">#${String(idx + 1).padStart(2, '0')}</td>
          <td>
            <span class="badge ${item.type === 'SERVICE' ? 'badge-service' : 'badge-part'}">
              ${item.type === 'SERVICE' ? 'SERVIÇO' : 'PEÇA'}
            </span>
          </td>
          <td><strong>${item.description}</strong></td>
          <td style="text-align: center; font-family: monospace;">${item.quantity}</td>
          ${
            !hideFinancials
              ? `<td style="text-align: right; font-family: monospace;">R$ ${item.unitPrice.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2
                })}</td>
                 <td style="text-align: right; font-family: monospace; font-weight: 700;">R$ ${item.totalPrice.toLocaleString(
                   'pt-BR',
                   { minimumFractionDigits: 2 }
                 )}</td>`
              : `<td style="text-align: center;"><span class="badge badge-ok">${
                  item.executed !== false ? 'EXECUTADO' : 'EM EXECUÇÃO'
                }</span></td>`
          }
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <!-- Linha do Tempo / Histórico do Início ao Fim -->
  ${
    timeline.length > 0
      ? `
  <div class="section-title">Histórico Cronológico da Manutenção (Início ao Fim)</div>
  <table>
    <thead>
      <tr>
        <th style="width: 115px;">Data / Hora</th>
        <th style="width: 90px;">Etapa</th>
        <th>Procedimento Realizado no Veículo</th>
        <th style="width: 110px;">Operador</th>
      </tr>
    </thead>
    <tbody>
      ${timeline
        .map(
          (log) => `
        <tr>
          <td style="font-family: monospace; font-size: 9px;">${new Date(log.timestamp).toLocaleString('pt-BR')}</td>
          <td><span class="badge badge-part">${log.stage}</span></td>
          <td><strong>${log.title}</strong> — <span style="color: #52525b;">${log.description}</span></td>
          <td style="font-family: monospace; font-size: 9px;">${log.operator}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
  `
      : ''
  }

  <!-- Fotos e Evidências -->
  ${
    evidences.length > 0
      ? `
  <div class="section-title">Registro Fotográfico de Evidências (${evidences.length} Fotos)</div>
  <div class="evidence-grid">
    ${evidences
      .map(
        (ev) => `
      <div class="evidence-card">
        <img src="${ev.imageUrl}" alt="${ev.title}" />
        <div class="evidence-body">
          <div style="font-family: monospace; font-size: 8px; font-weight: 700; color: #dc2626;">
            ${ev.phase === 'ENTRY' ? '1. ENTRADA' : ev.phase === 'PROCESS' ? '2. EXECUÇÃO' : '3. FINALIZAÇÃO'} • ${ev.category}
          </div>
          <div style="font-weight: 700; color: #18181b; margin-top: 1px;">${ev.title}</div>
          ${ev.notes ? `<div style="color: #52525b; margin-top: 1px;">${ev.notes}</div>` : ''}
        </div>
      </div>
    `
      )
      .join('')}
  </div>
  `
      : ''
  }

  <!-- Resumo Financeiro (Oculto no Modo Laudo Técnico / Operador) -->
  ${
    !hideFinancials
      ? `
  <div class="financial-grid">
    <div class="card">
      <div class="card-title">Condições & Observações</div>
      <div class="row">
        <span class="row-label">Forma de Pagamento:</span>
        <span class="row-val">${order.paymentMethod}</span>
      </div>
      ${
        order.notes
          ? `<div style="margin-top: 5px; font-size: 9.5px; color: #52525b; font-style: italic;">Obs: ${order.notes}</div>`
          : ''
      }
    </div>

    <div class="total-box">
      <div class="total-row">
        <span class="row-label">Subtotal Mão de Obra / Serviços:</span>
        <span class="row-val">R$ ${order.subtotalServices.toLocaleString('pt-BR', {
          minimumFractionDigits: 2
        })}</span>
      </div>
      <div class="total-row">
        <span class="row-label">Subtotal Peças / Insumos:</span>
        <span class="row-val">R$ ${order.subtotalParts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </div>
      ${
        order.discount > 0
          ? `
      <div class="total-row" style="color: #10b981; font-weight: 700;">
        <span>Desconto Concedido:</span>
        <span>- R$ ${order.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </div>
      `
          : ''
      }
      <div class="total-final">
        <span style="font-weight: 900; text-transform: uppercase; font-size: 11px;">Valor Total Líquido:</span>
        <span class="total-final-val">R$ ${order.totalAmount.toLocaleString('pt-BR', {
          minimumFractionDigits: 2
        })}</span>
      </div>
    </div>
  </div>
  `
      : ''
  }

  <!-- Termos de Garantia -->
  <div class="terms">
    <strong>Termo de Garantia & Responsabilidade Técnica 63 Motorsport:</strong><br>
    ${order.warrantyTerms}
  </div>

  <!-- Assinaturas -->
  <div class="signatures">
    <div>
      <div class="sig-line"></div>
      <div class="sig-name">63 MOTORSPORT PERFORMANCE LAB</div>
      <div class="sig-role">${order.leadOperator || 'Responsável Técnico / Preparador'}</div>
    </div>
    <div>
      <div class="sig-line"></div>
      <div class="sig-name">${order.client.name.toUpperCase()}</div>
      <div class="sig-role">De Acordo / Proprietário do Veículo</div>
    </div>
  </div>

  <!-- Rodapé -->
  <div class="footer-doc">
    63 Motorsport High Performance • Dossiê gerado eletronicamente em ${new Date().toLocaleDateString(
      'pt-BR'
    )} às ${new Date().toLocaleTimeString('pt-BR')} • ${order.osNumber}
  </div>
</body>
</html>
`;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.warn('Fallback para window.print():', err);
      window.print();
    } finally {
      setTimeout(() => {
        iframe.remove();
      }, 2000);
    }
  }, 250);
}
