import Swal from 'sweetalert2';

const swalDarkBase = {
    background: 'var(--bg-darker)',
    color: 'var(--text-main)',
    customClass: {
        popup: 'swal2-dark-popup',
        title: 'swal2-dark-title',
        htmlContainer: 'swal2-dark-text',
        confirmButton: 'swal2-dark-confirm',
        cancelButton: 'swal2-dark-cancel',
    },
    buttonsStyling: true,
} as const;

export const confirmDark = async (opts: {
    title: string;
    text: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
}) => {
    const res = await Swal.fire({
        ...swalDarkBase,
        icon: opts.danger ? 'warning' : 'question',
        title: opts.title,
        text: opts.text,
        showCancelButton: true,
        confirmButtonText: opts.confirmText ?? 'Confirmar',
        cancelButtonText: opts.cancelText ?? 'Cancelar',
        reverseButtons: true,
        confirmButtonColor: opts.danger ? '#ef4444' : '#00d9ff',
        cancelButtonColor: '#1f2937',
    });

    return res.isConfirmed;
};

export const notifyDark = async (opts: {
    icon: 'success' | 'error' | 'warning' | 'info' | 'question';
    title: string;
    text?: string;
}) => {
    await Swal.fire({
        ...swalDarkBase,
        icon: opts.icon,
        title: opts.title,
        text: opts.text,
        confirmButtonText: 'Ok',
        confirmButtonColor: '#00d9ff',
    });
};