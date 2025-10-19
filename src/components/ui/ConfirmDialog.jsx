import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, CircularProgress } from '@mui/material';
import { Close } from '@mui/icons-material';
import { getDialogMessage } from '../../utils/getDialogMessage';

const ConfirmDialog = ({ open, onClose, onConfirm, action, dependencies, isLoading }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
    >
      <DialogTitle id="confirm-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {action === 'delete' ? 'Підтвердження видалення' : 'Підтвердження деактивації'}
        <IconButton onClick={onClose} disabled={isLoading} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography>{getDialogMessage(action, dependencies)}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Скасувати
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : (action === 'delete' ? 'Видалити' : 'Деактивувати')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;