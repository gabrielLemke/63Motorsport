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

export function printIsolatedOrder(order: ServiceOrder) {
  // Remove iframes de impressão anteriores se houver
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

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Ordem de Serviço - ${order.osNumber} - ${order.client.name}</title>
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
      padding: 10px 15px;
      font-size: 12px;
      line-height: 1.4;
    }
    .header {
      border-bottom: 3px solid #dc2626;
      padding-bottom: 12px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 26px;
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
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #3f3f46;
      margin-top: 2px;
    }
    .brand-info {
      font-size: 10px;
      color: #71717a;
      margin-top: 3px;
    }
    .os-badge-box {
      background: #f4f4f5;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      padding: 8px 12px;
      text-align: right;
    }
    .os-badge-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #71717a;
      font-family: monospace;
    }
    .os-number {
      font-size: 20px;
      font-weight: 900;
      color: #dc2626;
      font-family: monospace;
      letter-spacing: -0.5px;
    }
    .os-status {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      background: #e4e4e7;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 3px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }
    .card {
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      padding: 10px 12px;
    }
    .card-title {
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #dc2626;
      border-bottom: 1px solid #e4e4e7;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
      font-size: 11px;
    }
    .row-label {
      color: #71717a;
    }
    .row-val {
      font-weight: 600;
      color: #18181b;
      text-align: right;
    }
    .dyno-box {
      background: #090a0d;
      color: #ffffff;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 14px;
    }
    .dyno-title {
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #27272a;
      padding-bottom: 4px;
      margin-bottom: 8px;
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
      padding: 6px;
    }
    .dyno-stat.highlight {
      background: #450a0a;
      border-color: #dc2626;
    }
    .dyno-stat-label {
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 700;
      color: #a1a1aa;
      display: block;
    }
    .dyno-stat-val {
      font-size: 15px;
      font-weight: 900;
      font-family: monospace;
      color: #f4f4f5;
    }
    .dyno-stat.highlight .dyno-stat-val {
      color: #ef4444;
    }
    .dyno-gain {
      font-size: 9px;
      font-weight: 700;
      color: #10b981;
      font-family: monospace;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 11px;
    }
    th {
      background: #f4f4f5;
      color: #3f3f46;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 9px;
      padding: 6px 8px;
      border-top: 1px solid #d4d4d8;
      border-bottom: 1px solid #d4d4d8;
      text-align: left;
    }
    td {
      padding: 6px 8px;
      border-bottom: 1px solid #e4e4e7;
    }
    tr:nth-child(even) {
      background: #fafafa;
    }
    .badge {
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 5px;
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
    .financial-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }
    .total-box {
      background: #f4f4f5;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      padding: 10px 12px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
      font-size: 11px;
    }
    .total-final {
      border-top: 2px solid #d4d4d8;
      padding-top: 6px;
      margin-top: 4px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .total-final-val {
      font-size: 18px;
      font-weight: 900;
      color: #dc2626;
      font-family: monospace;
    }
    .terms {
      border: 1px solid #e4e4e7;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 9px;
      color: #52525b;
      margin-bottom: 20px;
      background: #fafafa;
      line-height: 1.35;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      text-align: center;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e4e4e7;
    }
    .sig-line {
      border-bottom: 1px solid #18181b;
      width: 80%;
      margin: 0 auto 5px auto;
    }
    .sig-name {
      font-size: 11px;
      font-weight: 700;
      color: #18181b;
    }
    .sig-role {
      font-size: 9px;
      color: #71717a;
    }
    .footer-doc {
      text-align: center;
      font-size: 8px;
      font-family: monospace;
      color: #a1a1aa;
      margin-top: 15px;
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
      <div class="brand-sub">High Performance Lab & Dyno Center</div>
      <div class="brand-info">CNPJ: 42.163.063/0001-99 • Joinville / SC • Tel/WhatsApp: (47) 99882-1455</div>
      <div class="brand-info">contato@63motorsport.com.br • www.63motorsport.com.br</div>
    </div>

    <div class="os-badge-box">
      <div class="os-badge-label">ORDEM DE SERVIÇO</div>
      <div class="os-number">${order.osNumber}</div>
      <div class="os-status">${getStatusLabel(order.status)}</div>
      <div style="font-size: 9px; color: #71717a; font-family: monospace; margin-top: 3px;">
        Emissão: ${new Date(order.createdAt).toLocaleDateString('pt-BR')}
      </div>
    </div>
  </div>

  <!-- Cards Cliente & Veículo -->
  <div class="grid-2">
    <div class="card">
      <div class="card-title">Dados do Proprietário / Cliente</div>
      <div class="row">
        <span class="row-label">Nome:</span>
        <span class="row-val">${order.client.name}</span>
      </div>
      ${
        order.client.document
          ? `<div class="row"><span class="row-label">CPF/CNPJ:</span><span class="row-val">${order.client.document}</span></div>`
          : ''
      }
      <div class="row">
        <span class="row-label">Telefone:</span>
        <span class="row-val">${order.client.phone}</span>
      </div>
      ${
        order.client.email
          ? `<div class="row"><span class="row-label">E-mail:</span><span class="row-val">${order.client.email}</span></div>`
          : ''
      }
      ${
        order.client.city
          ? `<div class="row"><span class="row-label">Cidade:</span><span class="row-val">${order.client.city}</span></div>`
          : ''
      }
    </div>

    <div class="card">
      <div class="card-title">Identificação do Veículo</div>
      <div class="row">
        <span class="row-label">Veículo:</span>
        <span class="row-val">${order.vehicle.model}</span>
      </div>
      <div class="row">
        <span class="row-label">Placa:</span>
        <span class="row-val">${order.vehicle.plate || 'Não informada'}</span>
      </div>
      <div class="row">
        <span class="row-label">Ano / Km:</span>
        <span class="row-val">${order.vehicle.year || '-'} • ${order.vehicle.mileage || '-'}</span>
      </div>
      <div class="row">
        <span class="row-label">Combustível:</span>
        <span class="row-val">${order.vehicle.fuel || 'Gasolina Podium'}</span>
      </div>
      ${
        order.vehicle.currentSetup
          ? `<div class="row"><span class="row-label">Setup Atual:</span><span class="row-val">${order.vehicle.currentSetup}</span></div>`
          : ''
      }
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
    ${
      order.dynoTelemetry.tuner
        ? `<div style="font-size: 8px; color: #a1a1aa; text-align: right; margin-top: 6px; font-family: monospace;">Preparador: ${order.dynoTelemetry.tuner}</div>`
        : ''
    }
  </div>
  `
      : ''
  }

  <!-- Tabela de Serviços e Peças -->
  <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #18181b; margin-bottom: 5px;">
    Discriminação de Serviços e Peças Aplicadas
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th style="width: 80px;">Tipo</th>
        <th>Descrição Técnica do Serviço ou Insumo Racing</th>
        <th style="width: 45px; text-align: center;">Qtd</th>
        <th style="width: 90px; text-align: right;">Unitário</th>
        <th style="width: 90px; text-align: right;">Total</th>
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
          <td style="text-align: right; font-family: monospace;">R$ ${item.unitPrice.toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })}</td>
          <td style="text-align: right; font-family: monospace; font-weight: 700;">R$ ${item.totalPrice.toLocaleString(
            'pt-BR',
            { minimumFractionDigits: 2 }
          )}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <!-- Resumo Financeiro & Condições -->
  <div class="financial-grid">
    <div class="card">
      <div class="card-title">Condições & Observações</div>
      <div class="row">
        <span class="row-label">Forma de Pagamento:</span>
        <span class="row-val">${order.paymentMethod}</span>
      </div>
      ${
        order.notes
          ? `<div style="margin-top: 6px; font-size: 10px; color: #52525b; font-style: italic;">Obs: ${order.notes}</div>`
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
        <span style="font-weight: 900; text-transform: uppercase; font-size: 12px;">Valor Total Líquido:</span>
        <span class="total-final-val">R$ ${order.totalAmount.toLocaleString('pt-BR', {
          minimumFractionDigits: 2
        })}</span>
      </div>
    </div>
  </div>

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
      <div class="sig-role">Responsável Técnico / Preparador</div>
    </div>
    <div>
      <div class="sig-line"></div>
      <div class="sig-name">${order.client.name.toUpperCase()}</div>
      <div class="sig-role">De Acordo / Proprietário do Veículo</div>
    </div>
  </div>

  <!-- Rodapé -->
  <div class="footer-doc">
    63 Motorsport High Performance • Documento gerado eletronicamente em ${new Date().toLocaleDateString(
      'pt-BR'
    )} às ${new Date().toLocaleTimeString('pt-BR')} • ${order.osNumber}
  </div>
</body>
</html>
`;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Executa o diálogo de impressão no contexto exclusivo do iframe
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.warn('Fallback para window.print():', err);
      window.print();
    } finally {
      // Remove o iframe após a impressão ser disparada
      setTimeout(() => {
        iframe.remove();
      }, 2000);
    }
  }, 250);
}
