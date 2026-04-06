import Swal from 'sweetalert2';
import { useAppStore } from '../../core/store';


export type ProcessoLike = {
  id: number | string;
  numero?: string | number;
  numero_autos?: string;
  cliente?: { nome?: string };
};

export type UsuarioLike = {
  id: string | number;
  nome: string;
};

export type PrazoLike = {
  id?: number;
  status: string;
  data_fatal: string;
  data_final?: string | null;
  tarefa: string;
  processo: string | null;
  responsavel: string;
  usuario_id?: string | null;
  descricao?: string | null;
  tipo?: boolean; // false=Compromisso | true=Prazo
};

type Options = {
  prazo?: (PrazoLike & { tipo?: boolean }) | null;
  processosList?: ProcessoLike[];
  usuariosList?: UsuarioLike[];
  onSubmit?: (payload: Partial<PrazoLike>) => Promise<{ error?: any }>;
  relationName?: string;
  titleNew?: string;
  titleEdit?: string;
};

function escapeHtml(s: string) {
  return String(s)
    .split('&').join('&amp;')
    .split('<').join('&lt;')
    .split('>').join('&gt;')
    .split('"').join('&quot;')
    .split("'").join('&#039;');
}

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  background: 'var(--bg-darker)',
  color: 'var(--text-main)',
  customClass: { popup: 'swal-toast-custom' },
});

async function resolveSubmitter(params: {
  onSubmit?: (payload: Partial<PrazoLike>) => Promise<{ error?: any }>;
  relationName: string;
  isEdit: boolean;
  id?: number | string;
}) {
  const { onSubmit, relationName, isEdit, id } = params;

  if (typeof onSubmit === 'function') return onSubmit;

  let mod: any = null;
  try {
    mod = await import('../../services/supabase');
  } catch (e) {
    console.error('[openPrazoEditModal] Falha ao importar ../../services/supabase', e);
    return async () => ({
      error: new Error('Não foi possível importar services/supabase. Passe onSubmit na chamada do modal.'),
    });
  }

  const insertFn = mod?.insert;
  const updateFn = mod?.update;

  const rel = (relationName ?? '').trim();
  if (!rel) {
    return async () => ({ error: new Error('relationName está vazio. Informe o nome da tabela (ex: "Jur_Prazos").') });
  }

  if (!isEdit) {
    if (typeof insertFn !== 'function') {
      return async () => ({ error: new Error('insert não encontrado em services/supabase. Passe onSubmit explicitamente.') });
    }
    return async (payload: Partial<PrazoLike>) => {
      try { if (insertFn.length <= 1) return await insertFn(payload); } catch (_) { }
      try { return await insertFn(rel, payload); } catch (e) { return { error: e }; }
    };
  }

  if (typeof updateFn !== 'function') {
    return async () => ({ error: new Error('update não encontrado em services/supabase. Passe onSubmit explicitamente.') });
  }

  return async (payload: Partial<PrazoLike>) => {
    const safeId = id ?? (payload as any)?.id;

    try { if (updateFn.length === 2) return await updateFn(safeId, payload); } catch (_) { }
    try { if (updateFn.length >= 3) return await updateFn(rel, safeId, payload); } catch (_) { }
    try { return await updateFn(rel, payload); } catch (e) { return { error: e }; }
  };
}

function statusMeta(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'FEITO') return { label: 'FEITO', cls: 'pill-feito' };
  if (s === 'EM ANDAMENTO') return { label: 'EM ANDAMENTO', cls: 'pill-andamento' };
  return { label: 'PENDENTE', cls: 'pill-pendente' };
}

export async function openPrazoEditModal({
  prazo = null,
  processosList = [],
  usuariosList = [],
  onSubmit,
  relationName = 'Jur_Prazos',
  titleNew = 'Novo Compromisso',
  titleEdit = 'Atualizar Compromisso',
}: Options) {
  const isNew = !prazo;

  const initialProcesso = prazo?.processo ?? '';
  const initialTarefa = prazo?.tarefa ?? '';
  const toDateTimeLocal = (isoString?: string | null) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const initialDataFatal = toDateTimeLocal(prazo?.data_fatal);
  const initialDataFinal = toDateTimeLocal(prazo?.data_final);
  const initialDescricao = prazo?.descricao ?? '';
  const initialUsuarioId = prazo?.usuario_id != null ? String(prazo.usuario_id) : '';
  const initialTipoPrazo = !!prazo?.tipo;
  const initialStatus = (prazo?.status ?? 'PENDENTE').toUpperCase();
  const sMeta = statusMeta(initialStatus);

  const titleHtml = `
      <div class="swal-title-row">
        <span>${escapeHtml(isNew ? titleNew : titleEdit)}</span>
        <span id="swal-status-pill" class="swal-status-pill ${sMeta.cls}">${sMeta.label}</span>
      </div>
    `;

  const formHtml = `
    <div class="dex-form">

      <div class="dex-field">
        <label class="dex-label">Tarefa / Título</label>
        <input
          id="swal-tarefa"
          class="dex-control"
          autocomplete="off"
          value="${escapeHtml(initialTarefa)}"
          placeholder="Ex: Protocolar Petição, Reunião, Audiência..."
        />
      </div>

      <div class="dex-grid-2">
        <div class="dex-field">
          <label class="dex-label">Data Final</label>
          <input id="swal-data-final" class="dex-control dex-control-date" type="datetime-local" value="${escapeHtml(initialDataFinal)}" />
        </div>

        <div class="dex-field">
          <label class="dex-label">Data Fatal</label>
          <input id="swal-data-fatal" class="dex-control dex-control-date" type="datetime-local" value="${escapeHtml(initialDataFatal)}" />
        </div>
      </div>

      <div class="dex-grid-2">
        <div class="dex-field">
          <label class="dex-label">Processo</label>
          <select id="swal-processo" class="dex-control dex-select">
            <option value="">-- Em Branco --</option>
            ${processosList.map(proc => {
    const value = String(proc.numero ?? proc.id);
    const numeroLabel = proc.numero_autos || proc.numero || proc.id;
    const cliente = proc.cliente?.nome ? ` - ${proc.cliente.nome}` : '';
    const selected = String(initialProcesso) === value ? 'selected' : '';
    return `<option value="${escapeHtml(value)}" ${selected}>${escapeHtml(String(numeroLabel))}${escapeHtml(cliente)}</option>`;
  }).join('')}
          </select>
        </div>

        <div class="dex-field">
          <label class="dex-label">Responsável</label>
          <select id="swal-usuario" class="dex-control dex-select">
            <option value="">-- Selecionar --</option>
            ${usuariosList.map(u => {
    const sel = initialUsuarioId && String(u.id) === initialUsuarioId ? 'selected' : '';
    return `<option value="${escapeHtml(String(u.id))}" ${sel}>${escapeHtml(u.nome)}</option>`;
  }).join('')}
          </select>
        </div>
      </div>

      <div class="dex-grid-2">
        <div class="dex-field">
          <label class="dex-label">Tipo</label>
          <div class="dex-checkbox-row" style="margin-top: 5px;">
             <label class="dex-check">
               <input id="swal-tipo-compromisso" type="checkbox" name="swal-tipo-checkbox" ${initialTipoPrazo ? '' : 'checked'} />
               <span>Compromisso</span>
             </label>

             <label class="dex-check">
               <input id="swal-tipo-prazo" type="checkbox" name="swal-tipo-checkbox" ${initialTipoPrazo ? 'checked' : ''} />
               <span>Prazo Fatal</span>
             </label>
          </div>
        </div>

        <div class="dex-field">
          <label class="dex-label">Status</label>
          <select id="swal-status" class="dex-control dex-select">
            <option value="PENDENTE" ${initialStatus === 'PENDENTE' ? 'selected' : ''}>PENDENTE</option>
            <option value="EM ANDAMENTO" ${initialStatus === 'EM ANDAMENTO' ? 'selected' : ''}>EM ANDAMENTO</option>
            <option value="FEITO" ${initialStatus === 'FEITO' ? 'selected' : ''}>FEITO</option>
          </select>
        </div>
      </div>

      <div class="dex-field">
        <label class="dex-label">Descrição (Opcional)</label>
        <textarea id="swal-descricao" class="dex-control dex-textarea" placeholder="Detalhes adicionais...">${escapeHtml(initialDescricao)}</textarea>

        <div class="dex-desc-actions">
          <button type="button" id="swal-expand-descricao" class="dex-link-btn">Expandir</button>
        </div>
      </div>

      <div id="swal-desc-overlay" class="dex-overlay" style="display:none;">
        <div class="dex-overlay-card">
          <div class="dex-overlay-header">
            <div class="dex-overlay-title">Descrição</div>
            <button type="button" id="swal-desc-close" class="dex-overlay-close" aria-label="Fechar">✕</button>
          </div>
          <textarea id="swal-desc-overlay-text" class="dex-overlay-textarea" placeholder="Descrição..."></textarea>
          <div class="dex-overlay-footer">
            <button type="button" id="swal-desc-apply" class="dex-overlay-apply">Aplicar</button>
          </div>
        </div>
      </div>

    </div>

    <style>
      .dex-form { display:flex; flex-direction:column; gap: .62rem; text-align:left; font-family:'Inter', sans-serif; }
      .dex-grid-3 { display:grid; grid-template-columns: 1fr 1fr 1fr; gap: .6rem; }
      .dex-grid-2 { display:grid; grid-template-columns: 1fr 1fr; gap: .6rem; }
      @media (max-width: 520px) { .dex-grid-3, .dex-grid-2 { grid-template-columns: 1fr; } }

      .dex-field { display:flex; flex-direction:column; gap: .34rem; }
      .dex-label { font-size: .74rem; color:#9ca3af; font-weight: 900; line-height: 1.1; margin: 0; }

      .dex-control {
        width:100%;
        height: 2.45rem;
        border-radius:10px;
        font-size:0.92rem;
        background:#0b1220;
        border:1px solid rgba(255,255,255,0.10);
        color:#f3f4f6;
        padding:0 .8rem;
        outline:none;
        box-sizing:border-box;
        display:block;
      }
      .dex-control:focus { border-color: rgba(59,130,246,0.55); box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
      .dex-control-date { padding-right: 2.2rem; color-scheme: dark; }
      .dex-select option { background:#0b1220; color:#e5e7eb; }

      .dex-checkbox-row { display:flex; gap: 16px; align-items:center; flex-wrap: wrap; height: 2.45rem; }
      .dex-check { display:flex; align-items:center; gap: 8px; user-select:none; cursor: pointer; }
      .dex-check input { width:15px; height:15px; accent-color:#00d9ff; cursor: pointer; }
      .dex-check span { font-size: .78rem; color:#cbd5e1; font-weight: 900; }

      .dex-textarea {
        height: auto;
        min-height: 84px;
        max-height: 112px;
        padding: .65rem .8rem;
        resize: none;
        overflow: auto;
        line-height: 1.35;
      }

      .dex-desc-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: .2rem;
        margin-bottom: .55rem;
      }
      .dex-link-btn {
        background: transparent;
        border: 0;
        padding: 0;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
        font-weight: 950;
        font-size: .78rem;
        color: #60a5fa;
      }
      .dex-link-btn:hover { color:#93c5fd; text-decoration: underline; }

      /* Overlay expandir descrição */
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
        width: 34px; height: 34px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.04);
        color: #e5e7eb;
        cursor: pointer;
        font-weight: 950;
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
      .dex-overlay-textarea:focus { border-color: rgba(59,130,246,0.55); box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
      .dex-overlay-footer { display:flex; justify-content: flex-end; }
      .dex-overlay-apply {
        background: #10b981;
        color: #fff;
        padding: .58rem .85rem;
        border: none;
        border-radius: 12px;
        font-weight: 950;
        font-size: .82rem;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
      }
      .dex-overlay-apply:hover { background: #059669; }

      /* ✅ Header mais compacto */
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
      .pill-andamento { border-color: rgba(59,130,246,0.35); color: #93c5fd; background: rgba(59,130,246,0.10); }
      .pill-pendente { border-color: rgba(245,158,11,0.35); color: #fde68a; background: rgba(245,158,11,0.10); }

      .swal-modal-custom {
        border-radius: 14px !important;
        border: "1px solid var(--border-color)" !important;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.55) !important;
        padding: 0.75rem 0.75rem !important; /* ✅ menos espaço geral */
        width: 540px !important;
        max-width: 96% !important;
        overflow: hidden !important;
      }
      @media (max-width: 520px) { .swal-modal-custom { width: 440px !important; } }

      .swal2-popup.swal-modal-custom .swal2-html-container {
        margin: 0 !important;
        text-align: left;
        overflow: visible !important;
        max-height: none !important;
      }

      /* ✅ Botões sempre lado a lado */
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

      .swal2-confirm-custom {
        background: #10b981; color: #fff;
        padding: .65rem; border: none; border-radius: 10px;
        font-weight: 950; font-size: .85rem; cursor: pointer;
        font-family: 'Inter', sans-serif;
      }
      .swal2-confirm-custom:hover { background: #059669; }

      .swal2-cancel-custom {
        background: transparent; color: var(--text-main);
        padding: .65rem; border: 1px solid var(--border-color);
        border-radius: 10px; font-weight: 950; font-size: .85rem;
        cursor: pointer; font-family: 'Inter', sans-serif;
      }
      .swal2-cancel-custom:hover { background: rgba(128,128,128,0.10); }

      .swal2-validation-message {
        background: rgba(239,68,68,0.12) !important;
        color: #fca5a5 !important;
        border: 1px solid rgba(239,68,68,0.30) !important;
        border-radius: 8px !important;
        font-family: 'Inter', sans-serif !important;
        font-size: .82rem !important;
        margin: .35rem 0 0 0 !important;
        padding: .45rem .75rem !important;
      }

      .swal-toast-custom {
        border-radius: 12px !important;
        border: "1px solid var(--border-color)" !important;
        box-shadow: 0 20px 40px rgba(0,0,0,0.45) !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 0.85rem !important;
        padding: .75rem .85rem !important;
      }
    </style>
  `;

  const result = await Swal.fire({
    title: titleHtml,
    html: formHtml,
    focusConfirm: false,
    showCancelButton: true,
    background: 'var(--bg-darker)',
    color: 'var(--text-main)',
    buttonsStyling: false,
    confirmButtonText: isNew ? 'Salvar' : 'Atualizar',
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: 'swal-modal-custom',
      confirmButton: 'swal2-confirm-custom',
      cancelButton: 'swal2-cancel-custom',
      actions: 'swal2-actions-flex', // ✅ flex side-by-side
    },
    didOpen: () => {
      const cbComp = document.getElementById('swal-tipo-compromisso') as HTMLInputElement | null;
      const cbPrazo = document.getElementById('swal-tipo-prazo') as HTMLInputElement | null;

      const syncTipo = (isPrazo: boolean) => {
        if (cbComp) cbComp.checked = !isPrazo;
        if (cbPrazo) cbPrazo.checked = isPrazo;
      };
      syncTipo(initialTipoPrazo);
      cbComp?.addEventListener('change', () => syncTipo(false));
      cbPrazo?.addEventListener('change', () => syncTipo(true));

      // Status pill sync
      const statusSel = document.getElementById('swal-status') as HTMLSelectElement | null;
      const pill = document.getElementById('swal-status-pill') as HTMLSpanElement | null;

      const setPill = (status: string) => {
        if (!pill) return;
        const m = statusMeta(status);
        pill.textContent = m.label;
        pill.classList.remove('pill-feito', 'pill-pendente', 'pill-andamento');
        pill.classList.add(m.cls);
      };

      setPill(statusSel?.value || initialStatus);
      statusSel?.addEventListener('change', () => setPill(statusSel.value));

      // Expandir descrição
      const btnExpand = document.getElementById('swal-expand-descricao') as HTMLButtonElement | null;
      const overlay = document.getElementById('swal-desc-overlay') as HTMLDivElement | null;
      const overlayText = document.getElementById('swal-desc-overlay-text') as HTMLTextAreaElement | null;
      const btnClose = document.getElementById('swal-desc-close') as HTMLButtonElement | null;
      const btnApply = document.getElementById('swal-desc-apply') as HTMLButtonElement | null;
      const inputDesc = document.getElementById('swal-descricao') as HTMLTextAreaElement | null;

      const openOverlay = () => {
        if (!overlay || !overlayText) return;
        overlayText.value = inputDesc?.value ?? '';
        overlay.style.display = 'flex';
        setTimeout(() => overlayText.focus(), 0);
      };
      const closeOverlay = () => { if (overlay) overlay.style.display = 'none'; };

      const openCbCompromisso = document.getElementById('swal-tipo-compromisso') as HTMLInputElement | null;
      const openCbPrazo = document.getElementById('swal-tipo-prazo') as HTMLInputElement | null;

      if (openCbCompromisso && openCbPrazo) {
        openCbCompromisso.addEventListener('change', () => {
          if (openCbCompromisso.checked) openCbPrazo.checked = false;
          else if (!openCbPrazo.checked) openCbCompromisso.checked = true;
        });
        openCbPrazo.addEventListener('change', () => {
          if (openCbPrazo.checked) openCbCompromisso.checked = false;
          else if (!openCbCompromisso.checked) openCbPrazo.checked = true;
        });
      }

      btnExpand?.addEventListener('click', openOverlay);
      btnClose?.addEventListener('click', closeOverlay);
      overlay?.addEventListener('click', (ev) => { if (ev.target === overlay) closeOverlay(); });

      btnApply?.addEventListener('click', () => {
        if (inputDesc && overlayText) inputDesc.value = overlayText.value;
        closeOverlay();
      });
    },
    preConfirm: async () => {
      const tarefa = (document.getElementById('swal-tarefa') as HTMLInputElement).value?.trim();
      const data_fatal_raw = (document.getElementById('swal-data-fatal') as HTMLInputElement).value;
      const data_final_raw = (document.getElementById('swal-data-final') as HTMLInputElement).value;

      const processoRaw = (document.getElementById('swal-processo') as HTMLSelectElement).value;
      const usuarioRaw = (document.getElementById('swal-usuario') as HTMLSelectElement).value;
      const descricaoRaw = (document.getElementById('swal-descricao') as HTMLTextAreaElement).value;

      const cbPrazo = (document.getElementById('swal-tipo-prazo') as HTMLInputElement | null)?.checked ?? false;
      const statusRaw = (document.getElementById('swal-status') as HTMLSelectElement).value;

      const processo = processoRaw && processoRaw.trim() !== '' ? processoRaw.trim() : null;
      const usuario_id = usuarioRaw ? String(usuarioRaw) : null;
      const descricao = descricaoRaw?.trim() ? descricaoRaw.trim() : null;
      const toISO = (val: string | null) => {
        if (!val || val.trim() === '') return null;
        try {
          const d = new Date(val); // Parses 'YYYY-MM-DDTHH:mm' as local time
          if (isNaN(d.getTime())) return val;
          return d.toISOString();
        } catch {
          return val;
        }
      };

      const data_fatal = toISO(data_fatal_raw);
      const data_final = toISO(data_final_raw);

      if (!tarefa) {
        Swal.showValidationMessage('A Tarefa / Título é obrigatória.');
        return false;
      }

      if (cbPrazo && !processo) {
        Swal.showValidationMessage('Para cadastrar um Prazo, informe o número do processo.');
        return false;
      }

      if (!data_fatal && !data_final) {
        Swal.showValidationMessage('Informe pelo menos uma data (Final ou Fatal).');
        return false;
      }

      const responsavelTexto =
        usuario_id && usuariosList.some(u => String(u.id) === String(usuario_id))
          ? (usuariosList.find(u => String(u.id) === String(usuario_id))?.nome || '')
          : '';

      return {
        tarefa,
        data_fatal,
        data_final,
        processo,
        usuario_id,
        responsavel: responsavelTexto,
        descricao,
        tipo: cbPrazo,
        status: statusRaw || (prazo?.status ?? 'PENDENTE'),
      } as Partial<PrazoLike>;
    },
  });

  if (!result.isConfirmed || !result.value) return;

  try {
    Swal.fire({
      title: 'Salvando...',
      text: 'Aguarde um instante.',
      background: 'var(--bg-darker)',
      color: 'var(--text-main)',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const submit = await resolveSubmitter({
      onSubmit,
      relationName,
      isEdit: !isNew,
      id: prazo?.id,
    });

    const { error } = await submit(result.value);
    if (error) throw error;

    await Swal.fire({
      icon: 'success',
      title: 'Sucesso',
      text: isNew
        ? `${result.value.tipo ? 'Prazo' : 'Compromisso'} registrado!`
        : `${result.value.tipo ? 'Prazo' : 'Compromisso'} atualizado!`,
      background: 'var(--bg-darker)',
      color: 'var(--text-main)',
      confirmButtonText: 'OK',
      buttonsStyling: false,
      customClass: { popup: 'swal-modal-custom', confirmButton: 'swal2-confirm-custom' },
    });
  } catch (e: any) {
    const msg = e?.message || e?.details || e?.hint || JSON.stringify(e) || 'Erro ao salvar.';
    await Swal.fire({
      icon: 'error',
      title: 'Erro ao salvar',
      text: msg,
      background: 'var(--bg-darker)',
      color: 'var(--text-main)',
      confirmButtonText: 'OK',
      buttonsStyling: false,
      customClass: { popup: 'swal-modal-custom', confirmButton: 'swal2-confirm-custom' },
    });
  }
}