import Swal from 'sweetalert2';

export const showAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    return Swal.fire({
        title,
        text,
        icon,
        background: 'var(--bg-darker)',
        color: '#f0f4f8',
        confirmButtonColor: '#00d9ff',
        customClass: {
            popup: 'cyber-alert-popup'
        }
    });
};

export const showConfirm = (title: string, text: string, confirmText: string = 'Sim', cancelText: string = 'Cancelar') => {
    return Swal.fire({
        title,
        text,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        background: 'var(--bg-darker)',
        color: '#f0f4f8',
        confirmButtonColor: '#00d9ff',
        cancelButtonColor: '#374151',
        customClass: {
            popup: 'cyber-alert-popup'
        }
    });
};

export const showToast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    return Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon,
        title,
        background: 'var(--bg-darker)',
        color: '#f0f4f8'
    });
};

export const showLoading = (title: string = 'Carregando...', text: string = 'Por favor, aguarde.') => {
    return Swal.fire({
        title,
        text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: 'var(--bg-darker)',
        color: '#f0f4f8',
        didOpen: () => {
            Swal.showLoading();
        }
    });
};

export const closeAlert = () => {
    Swal.close();
};
