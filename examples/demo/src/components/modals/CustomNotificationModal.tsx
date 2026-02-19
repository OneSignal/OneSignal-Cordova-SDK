import { useEffect, useState } from 'react';
import type { FC } from 'react';
import ModalShell from './ModalShell';

interface CustomNotificationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, body: string) => void;
}

const CustomNotificationModal: FC<CustomNotificationModalProps> = ({ open, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (open) {
      setTitle('');
      setBody('');
    }
  }, [open]);

  return (
    <ModalShell open={open}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const trimmedTitle = title.trim();
          const trimmedBody = body.trim();
          if (!trimmedTitle || !trimmedBody) return;
          onSubmit(trimmedTitle, trimmedBody);
        }}
      >
        <h3>Custom Notification</h3>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
        <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Body" />
        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Send</button>
        </div>
      </form>
    </ModalShell>
  );
};

export default CustomNotificationModal;
