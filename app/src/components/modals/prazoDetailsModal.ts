import Swal from 'sweetalert2';

export type ProcessoLike = {
  id: number | string;
  numero?: string | number;
  numero_autos?: string;
  cliente?: { nome?: string };
};

export type PrazoLike = {
  id?: number;
  status: string;
  data_fatal: string;
  data_final?: string | null;
  tarefa: string;
  processo: string | null;
  responsavel: string;
  descricao?: string | null;
  tipo?: boolean;
};

type Options = {
  prazo: PrazoLike;
  processosList?: ProcessoLike[];
  onOpenProcess?: (processoId: number | string) => void;
  onEdit?: (prazo: PrazoLike) => void;
};

function statusMeta(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'FEITO') return { label: 'FEITO', cls: 'pill-feito' };
  if (s === 'EM ANDAMENTO') return { label: 'EM ANDAMENTO', cls: 'pill-em-andamento' };
  if (s) return { label: s, cls: 'pill-pendente' };
  return { label: 'PENDENTE', cls: 'pill-pendente' };
}

export async function openPrazoDetailsModal({
  prazo,
  processosList = [],
  onOpenProcess,
  onEdit,
}: Options) {
  const p = prazo;
  const tipoPrazo = !!p.tipo;

  const matchProc = processosList.find(proc => (proc.numero ?? proc.id) == p.processo);
  const procIdToNav = matchProc ? matchProc.id : null;

  const showEdit = typeof onEdit === 'function';
  const showOpenProcess = !!procIdToNav && typeof onOpenProcess === 'function';

  const sMeta = statusMeta(p.status);
  const titleHtml = `
    <div class="swal-title-row">
      <span>Detalhes</span>
      <span class="swal-status-pill ${sMeta.cls}">${sMeta.label}</span>
    </div>
  `;

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} as ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '-';
    }
  };

  const dataFinalStr = formatDateTime(p.data_final);

  const html = `
    <div class="dex-view">
      <div class="dex-field">
        <label class="dex-label">Tarefa / Título</label>
        <div class="dex-box">${p.tarefa ?? '-'}</div>
      </div>

      <div class="dex-grid-2">
        <div class="dex-field">
          <label class="dex-label">Data Final</label>
          <div class="dex-box">${dataFinalStr}</div>
        </div>

        <div class="dex-field">
          <label class="dex-label">Data Fatal</label>
          <div class="dex-box">${formatDateTime(p.data_fatal)}</div>
        </div>
      </div>

      <div class="dex-grid-2">
        <div class="dex-field">
          <label class="dex-label">Processo</label>
          <div class="dex-box">${matchProc ? (matchProc.numero_autos || matchProc.numero || matchProc.id) : (p.processo || '-- Em Branco --')}</div>
        </div>

        <div class="dex-field">
          <label class="dex-label">Responsável</label>
          <div class="dex-box">${p.responsavel || 'Eu'}</div>
        </div>
      </div>

      <div class="dex-field">
        <label class="dex-label">Tipo</label>
        <div class="dex-checkbox-row">
          <label class="dex-check">
            <input type="checkbox" disabled ${tipoPrazo ? '' : 'checked'} />
            <span>Compromisso</span>
          </label>

          <label class="dex-check">
            <input type="checkbox" disabled ${tipoPrazo ? 'checked' : ''} />
            <span>Prazo</span>
          </label>
        </div>
      </div>

      <div class="dex-field">
        <label class="dex-label">Descrição</label>
        <div class="dex-desc-preview">${(p.descricao ?? '').trim() ? (p.descricao ?? '') : '-'}</div>

        ${(p.descricao ?? '').trim()
      ? `<div class="dex-desc-actions">
               <button type="button" id="swal-expand-descricao" class="dex-link-btn">Expandir</button>
             </div>`
      : ''}
      </div>

      <div id="swal-desc-overlay" class="dex-overlay" style="display:none;">
        <div class="dex-overlay-card">
          <div class="dex-overlay-header">
            <div class="dex-overlay-title">Descrição</div>
            <button type="button" id="swal-desc-close" class="dex-overlay-close" aria-label="Fechar">✕</button>
          </div>
          <textarea id="swal-desc-overlay-text" class="dex-overlay-textarea" readonly>${(p.descricao ?? '')}</textarea>
          <div class="dex-overlay-footer">
            <button type="button" id="swal-desc-apply" class="dex-overlay-apply">Fechar</button>
          </div>
        </div>
      </div>
    </div>

    <style>
      .dex-view { display:flex; flex-direction:column; gap: .62rem; text-align:left; font-family:'Inter', sans-serif; }
      .dex-grid-2 { display:grid; grid-template-columns: 1fr 1fr; gap: .6rem; }
      @media (max-width: 520px) { .dex-grid-2 { grid-template-columns: 1fr; } }

      .dex-field { display:flex; flex-direction:column; gap: .34rem; }
      .dex-label { font-size: .74rem; color:#9ca3af; font-weight: 900; line-height: 1.1; margin: 0; }

      .dex-box {
        width:100%;
        min-height: 2.45rem;
        border-radius:10px;
        font-size:0.92rem;
        background:#0b1220;
        border:1px solid rgba(255,255,255,0.10);
        color:#f3f4f6;
        padding:.55rem .8rem;
        box-sizing:border-box;
        display:flex;
        align-items:center;
      }

      .dex-checkbox-row { display:flex; gap: 16px; align-items:center; flex-wrap: wrap; }
      .dex-check { display:flex; align-items:center; gap: 8px; user-select:none; }
      .dex-check input { width:15px; height:15px; accent-color:#00d9ff; }
      .dex-check span { font-size: .78rem; color:#cbd5e1; font-weight: 900; }

      .dex-desc-preview {
        background:#0b1220;
        border:1px solid rgba(255,255,255,0.10);
        border-radius:10px;
        color:#f3f4f6;
        padding:.65rem .8rem;
        font-size:.88rem;
        line-height:1.35;
        max-height: 110px;
        overflow: hidden;
        white-space: pre-wrap;
      }

      .dex-desc-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: .2rem;
        margin-bottom: .55rem;
      }
      .dex-link-btn {
        background: transparent; border: 0; padding: 0; cursor: pointer;
        font-family: 'Inter', sans-serif; font-weight: 950; font-size: .78rem; color: #60a5fa;
      }
      .dex-link-btn:hover { color:#93c5fd; text-decoration: underline; }

      .dex-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.60); display: flex; align-items: center; justify-content: center; z-index: 999999; }
      .dex-overlay-card {
        width: min(720px, 94vw);
        background: #0b1220;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 14px;
        box-shadow: 0 30px 70px rgba(0,0,0,0.65);
        padding: .85rem;
        display: flex;
        flex-direction: column;
        gap: .55rem;
      }
      .dex-overlay-header { display:flex; align-items:center; justify-content: space-between; gap: .75rem; }
      .dex-overlay-title { font-family:'Inter', sans-serif; font-weight: 950; color:#fff; font-size: .95rem; }
      .dex-overlay-close {
        width: 34px; height: 34px; border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.04);
        color: #e5e7eb; cursor: pointer; font-weight: 950;
      }
      .dex-overlay-close:hover { background: rgba(255,255,255,0.08); }
      .dex-overlay-textarea {
        width: 100%;
        min-height: 240px;
        max-height: 60vh;
        resize: none;
        overflow: auto;
        border-radius: 12px;
        background: #0b1220;
        border: 1px solid rgba(255,255,255,0.10);
        color: #f3f4f6;
        padding: .75rem .85rem;
        outline: none;
        font-family: 'Inter', sans-serif;
        line-height: 1.4;
        box-sizing: border-box;
      }
      .dex-overlay-footer { display:flex; justify-content: flex-end; }
      .dex-overlay-apply {
        background: #10b981; color: #fff;
        padding: .58rem .85rem; border: none; border-radius: 12px;
        font-weight: 950; font-size: .82rem; cursor: pointer; font-family: 'Inter', sans-serif;
      }
      .dex-overlay-apply:hover { background: #059669; }

      /* ✅ Header compacto */
      .swal2-header { padding: 0 !important; margin: 0 !important; }
      .swal2-title {
        font-family: 'Inter', sans-serif !important;
        font-size: 1.0rem !important;
        font-weight: 950 !important;
        color: #fff !important;
        text-align: left !important;
        padding: 0 0 .35rem 0 !important;
        margin: 0 !important;
        line-height: 1.15 !important;
      }
      .swal-title-row { display:flex; align-items:center; justify-content: space-between; gap: .5rem; padding: 0 .15rem; }

      .swal-status-pill {
        font-size: .74rem;
        font-weight: 900;
        padding: .20rem .52rem;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.04);
        color: #e5e7eb;
        white-space: nowrap;
      }
      .pill-feito { border-color: rgba(16,185,129,0.35); color: #a7f3d0; background: rgba(16,185,129,0.10); }
      .pill-em-andamento { border-color: rgba(59,130,246,0.35); color: #bfdbfe; background: rgba(59,130,246,0.10); }
      .pill-pendente { border-color: rgba(245,158,11,0.35); color: #fde68a; background: rgba(245,158,11,0.10); }

      .swal-modal-custom {
        border-radius: 14px !important;
        border: "1px solid var(--border-color)" !important;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.55) !important;
        padding: 0.75rem 0.75rem !important;
        width: 540px !important;
        max-width: 96% !important;
        overflow: hidden !important;
      }

      .swal2-popup.swal-modal-custom .swal2-html-container { margin: 0 !important; text-align: left; overflow: visible !important; max-height: none !important; }

      /* ✅ Botões lado a lado */
      .swal2-actions { margin: 0 !important; padding: 0 !important; }
      .swal2-actions-flex {
        display: flex;
        gap: .55rem;
        width: 100%;
        margin-top: .65rem;
        padding: 0;
        flex-wrap: wrap;
      }
      .swal2-actions-flex > button {
        flex: 1 1 160px;
        min-width: 140px;
      }

      .swal2-confirm-custom, .swal2-deny-custom, .swal2-cancel-custom {
        width: 100%;
        padding: .65rem;
        border-radius: 10px;
        font-weight: 950;
        font-size: .85rem;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
      }
      .swal2-confirm-custom { background:#10b981; color:#fff; border:none; }
      .swal2-confirm-custom:hover { background:#059669; }
      .swal2-deny-custom { background:#3b82f6; color:#fff; border:none; }
      .swal2-deny-custom:hover { background:#2563eb; }
      .swal2-cancel-custom { background:transparent; color:var(--text-main); border:1px solid var(--border-color); }
      .swal2-cancel-custom:hover { background: rgba(128,128,128,0.10); }
    </style>
  `;

  const result = await Swal.fire({
    title: titleHtml,
    html,
    background: 'var(--bg-darker)',
    color: 'var(--text-main)',
    showCancelButton: true,
    showConfirmButton: showEdit,
    showDenyButton: showOpenProcess,
    confirmButtonText: 'Editar',
    denyButtonText: 'Abrir Processo',
    cancelButtonText: 'Fechar',
    buttonsStyling: false,
    customClass: {
      popup: 'swal-modal-custom',
      confirmButton: 'swal2-confirm-custom',
      denyButton: 'swal2-deny-custom',
      cancelButton: 'swal2-cancel-custom',
      actions: 'swal2-actions-flex', // ✅ flex side-by-side
    },
    didOpen: () => {
      const btnExpand = document.getElementById('swal-expand-descricao') as HTMLButtonElement | null;
      const overlay = document.getElementById('swal-desc-overlay') as HTMLDivElement | null;
      const btnClose = document.getElementById('swal-desc-close') as HTMLButtonElement | null;
      const btnApply = document.getElementById('swal-desc-apply') as HTMLButtonElement | null;

      const openOverlay = () => { if (overlay) overlay.style.display = 'flex'; };
      const closeOverlay = () => { if (overlay) overlay.style.display = 'none'; };

      btnExpand?.addEventListener('click', openOverlay);
      btnClose?.addEventListener('click', closeOverlay);
      btnApply?.addEventListener('click', closeOverlay);

      overlay?.addEventListener('click', (ev) => { if (ev.target === overlay) closeOverlay(); });
    },
  });

  if (result.isConfirmed && onEdit) onEdit(p);
  if (result.isDenied && procIdToNav && onOpenProcess) onOpenProcess(procIdToNav);
}